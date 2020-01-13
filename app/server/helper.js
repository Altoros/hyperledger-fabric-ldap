const jwt = require('jsonwebtoken');

const {
    LDAP_HOST = 'localhost',
    DOMAIN = 'example.com',
    JWT_SECRET = 'example_secret'
} = process.env;

const ldapConfig = {
    url: `ldaps://${LDAP_HOST}`,
    bindDn: `ou=users,ou=fabric,dc=hyperledeger,dc=${DOMAIN.split('.')[0]},dc=${
        DOMAIN.split('.')[1]
        }`,
    adminDn: `cn=admin,dc=${DOMAIN.split('.')[0]},dc=${DOMAIN.split('.')[1]}`,
    adminPw: `admin`,
    baseDn: `dc=${DOMAIN.split('.')[0]},dc=${DOMAIN.split('.')[1]}`,
    timeout: 5000,
    connectTimeout: 10000,
    reconnect: true
};

const defaultAttrs = [
    "cn",
    "gidNumber",
    "givenName",
    "homeDirectory",
    "loginShell",
    "mail",
    "o",
    "objectClass",
    "ou",
    "sn",
    "st",
    "uid",
    "uidNumber",
    "memberOf"
];

const checkJWT = async ({cookies, hostname}, res) => {
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
            res.cookie('jwt', '', {httpOnly: true, domain: hostname});
            return null;
        }
    } else {
        return null;
    }
};

const folders = async function getFolders(path) {
    let result = Array();
    let files = await fs.readdir(path);
    for (let i = 0; i < files.length; i++) {
        var filePath = path + '/' + file;
        if (await fs.stat(filePath).isDirectory()) {
            result.push(filePath);
        }
    }
    return result;
};

module.exports = {ldapConfig, checkJWT, defaultAttrs, folders};
