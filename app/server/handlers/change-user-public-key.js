const ldap = require('ldapjs');
const ldapError = require('./ldap-error');

const {log, ldapConfig} = require('../helper');

const {decrypt} = require('./encryption');

const changeUserPublicKey = ({userId, password, publicKey}) =>
    new Promise((resolve, reject) => {
        const ldapClient = ldap.createClient(ldapConfig);

        ldapClient.bind(`uid=${userId},${ldapConfig.bindDn}`, password, error => {
            if (error) {
                console.error(error);
                return reject(error);
            }

            if (!publicKey) {
                return reject(new Error('Invalid public key'));
            }
            return ldapClient.modify(
                `uid=${userId},${ldapConfig.bindDn}`, // req.jwt.user.dn,
                [
                    new ldap.Change({
                        operation: 'replace',
                        modification: {
                            'ecdsa-public-key': publicKey
                        }
                    })
                ],
                err => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    return resolve();
                }
            );
        });
    });

module.exports = async (req, res) => {
    let actor = req.user.user_info.full_name ? req.user.user_info.full_name : ORG;
    try {
        await changeUserPublicKey({
            userId: req.user.user_info.full_name,
            password: decrypt(req.user.secret),
            publicKey: req.body.publicKey
        });
        await log('generate-key-pair', actor, {success: true});
        return res.status(200).send({ok: true});
    } catch (e) {
        console.error(e);
        await log('generate-key-pair', actor, {success: false, error: e.message});
        return res.status(ldapError(e).code).send({ok: false, error: ldapError(e).msg});
    }
};
