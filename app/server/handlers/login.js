const ldap = require('ldapjs');
const jwt = require('jsonwebtoken');
const ldapError = require('./ldap-error');

const { log } = require('../helper');

const PERMISSIONS = require('../permissions.json');

const { ldapConfig } = require('../helper');

const { JWT_SECRET = 'example_secret', ORG = 'example' } = process.env;

const { encrypt } = require('./encryption');

const checkPermissionExists = (a, obj) => {
  let i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
};

const authenticate = (userId, password) =>
  new Promise((resolve, reject) => {
    const ldapClient = ldap.createClient(ldapConfig);
    ldapClient.bind(
      `uid=${userId},${ldapConfig.bindDn}`,
      password,
      (err, res) => {
        if (err) {
          // @see https://github.com/mcavage/node-ldapjs/blob/7059cf6b8a0b4ff4c566714d97f3cef04f887c3b/test/client.test.js @ 305
          return reject(err);
        }
        ldapClient.unbind();
        resolve(res);
      }
    );
  });

const userLdapInfo = (userId, password) =>
  new Promise((resolve, reject) => {
    const ldapClient = ldap.createClient(ldapConfig);
    ldapClient.bind(
      `uid=${userId},${ldapConfig.bindDn}`,
      password,
      (err, res) => {
        if (err) {
          // @see https://github.com/mcavage/node-ldapjs/blob/7059cf6b8a0b4ff4c566714d97f3cef04f887c3b/test/client.test.js @ 305
          return reject(err);
        }
        const options = {
          scope: 'sub',
          filter: `(&(objectclass=groupOfNames)(member=uid=${userId},${ldapConfig.bindDn}))`
        };
        ldapClient.search(ldapConfig.baseDn, options, (err, res) => {
          if (err) {
            return reject(err);
          }
          const entries = [];
          res.on('searchEntry', entry => {
            const r = entry.object;
            entries.push(r);
          });

          res.on('error', err => {
            reject(err);
          });

          res.on('end', () => {
            ldapClient.unbind();
            const user_info = {};
            user_info.full_name = userId;
            user_info.roles = [];
            user_info.permissions = [];
            entries.forEach(group => {
              user_info.roles.push(group.cn);
              PERMISSIONS.forEach(permission => {
                if (permission in group) {
                  if (
                    group[permission] === 'TRUE' &&
                    !checkPermissionExists(user_info.permissions, permission)
                  ) {
                    user_info.permissions.push(permission);
                  }
                }
              });
            });
            resolve(user_info);
          });
        });
      }
    );
  });

module.exports = async (req, res) => {
  try {
    const userAuth = await authenticate(req.body.username, req.body.password);
    const expires = new Date();
    expires.setDate(expires.getDate() + 2); // 2 days
    const tokenMsg = {
      email: req.body.username,
      exp: expires.getTime(),
      user_name: req.body.username,
      org_name: ORG,
      secret: encrypt(req.body.password),
      user_info: {
        full_name: req.body.username,
        roles: [],
        permissions: []
      },
      force_password_change: false
    };
    try {
      const userInfo = await userLdapInfo(req.body.username, req.body.password);
      tokenMsg.user_info.roles = userInfo.roles;
      tokenMsg.user_info.permissions = userInfo.permissions;
    } catch (e) {
      tokenMsg.force_password_change = ldapError(e).pwdMustChange;
    }

    const token = jwt.sign(tokenMsg, JWT_SECRET);
    res.cookie('jwt', token, { httpOnly: true, domain: req.hostname });
    await log('login', req.body.username, { success: true });
    return res.json({ jwt: token });
  } catch (e) {
    await log('login', req.body.username, { success: false, error: e.message });
    return res.status(ldapError(e).code).send({ error: ldapError(e).msg });
  }
};
