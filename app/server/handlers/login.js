const ldap = require('ldapjs');
const jwt = require('jsonwebtoken');
const ldapError = require('../tools/ldap-error');
const {enroll} = require('../fabric/fabric-enroll-user');
const x509 = require('x509');

const {ldapConfig} = require('../helper');

const {JWT_SECRET = 'example_secret', ORG = 'example'} = process.env;

const {encrypt} = require('../tools/encryption');

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
            `${ldapConfig.adminDn}`,
            `${ldapConfig.adminPw}`,
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
                        user_info.groups = [];
                        entries.forEach(group => {
                            user_info.groups.push(group.cn);
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
                groups: [],
            },
            force_password_change: false
        };
        try {
            const userInfo = await userLdapInfo(req.body.username, req.body.password);
            tokenMsg.user_info.groups = userInfo.groups;
        } catch (e) {
            tokenMsg.force_password_change = ldapError(e).pwdMustChange;
        }

        let cert;
        try {
            const result = await enroll(req.body.username, req.body.password);
            if (result.success && result.identity && result.enrollment) {
                cert = x509.parseCert(result.enrollment.certificate);
                tokenMsg.user_info.cert = cert;
            }
        } catch (e) {
            return res.status(401).send({error: e})
        }

        const token = jwt.sign(tokenMsg, JWT_SECRET);
        res.cookie('jwt', token, {httpOnly: true, domain: req.hostname});
        return res.json({jwt: token});
    } catch (e) {
        return res.status(ldapError(e).code).send({error: ldapError(e).msg});
    }
};
