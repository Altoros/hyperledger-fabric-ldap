const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ldap = require('ldapjs');

const logSchema = require('./database/schemas/log');

const logsTable = mongoose.model('logs', logSchema);

const {
  ORG = 'example',
  LDAP_HOST = 'localhost',
  DOMAIN = 'example.com',
  JWT_SECRET = 'example_secret'
} = process.env;

const ldapConfig = {
  url: `ldaps://${LDAP_HOST}`,
  bindDn: `ou=users,dc=${ORG},dc=${DOMAIN.split('.')[0]},dc=${
    DOMAIN.split('.')[1]
  }`,
  baseDn: `dc=${DOMAIN.split('.')[0]},dc=${DOMAIN.split('.')[1]}`,
  timeout: 5000,
  connectTimeout: 10000,
  reconnect: true
};

const checkJWT = async ({ cookies, hostname }, res) => {
  if (cookies && cookies.jwt) {
    if (cookies.jwt === 'undefined') {
      delete cookies.jwt;
      return null;
    }
    try {
      const result = await jwt.verify(cookies.jwt, JWT_SECRET);
      res.cookie('jwt', cookies.jwt, {
        httpOnly: true,
        domain: hostname
      });
      return result;
    } catch (e) {
      console.error('Invalid jwt');
      res.cookie('jwt', '', { httpOnly: true, domain: hostname });
      return null;
    }
  } else {
    return null;
  }
};

const log = async (type, user, meta = {}) => {
  try {
    await logsTable.create({
      type,
      user,
      meta,
      timestamp: new Date()
    });
  } catch (e) {
    console.error(e);
  }
};

const getUserPublicKey = ({ userId, password }) =>
  new Promise((resolve, reject) => {
    const ldapClient = ldap.createClient(ldapConfig);

    ldapClient.bind(`uid=${userId},${ldapConfig.bindDn}`, password, error => {
      if (error) {
        console.error(error);
        return reject(error);
      }

      const options = {
        scope: 'sub',
        filter: `(&(objectclass=inetOrgPerson)(uid=${userId}))`
      };
      return ldapClient.search(ldapConfig.baseDn, options, (err, res) => {
        if (err) {
          return reject(err);
        }
        let publicKey;

        res.on('searchEntry', entry => {
          const r = entry.object;
          if ('ecdsa-public-key' in r) {
            publicKey = r['ecdsa-public-key'];
          }
        });

        res.on('error', err => {
          return reject(err);
        });

        res.on('end', () => {
          ldapClient.unbind();
          return resolve(JSON.parse(publicKey));
        });
      });
    });
  });

module.exports = { log, ldapConfig, checkJWT, getUserPublicKey };
