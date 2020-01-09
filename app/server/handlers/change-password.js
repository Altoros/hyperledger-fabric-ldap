const ldap = require('ldapjs');
const ldapError = require('./ldap-error');

const {ldapConfig} = require('../helper');

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NewPasswordValidationError';
    }
}

const {ORG = 'example'} = process.env;

const changePassword = ({
                            userId,
                            newPassword,
                            newPasswordRepeat,
                            oldPassword
                        }) =>
    new Promise((resolve, reject) => {
        const client = ldap.createClient(ldapConfig);
        client.bind(userId, oldPassword, error => {
            if (error) {
                console.error(error);
                return reject(error);
            }

            if (newPassword !== newPasswordRepeat) {
                return reject(
                    new ValidationError('The fields of new password mismatch')
                );
            }

            return client.modify(
                userId, // req.jwt.user.dn,
                [
                    new ldap.Change({
                        operation: 'replace',
                        modification: {
                            userPassword: newPassword
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
    try {
        await changePassword({
            userId: `uid=${req.user.user_info.full_name},${ldapConfig.bindDn}`,
            newPassword: req.body.newPassword,
            oldPassword: req.body.currentPassword,
            newPasswordRepeat: req.body.newPasswordRepeat
        });
        return res.status(200).send({ok: true});
    } catch (e) {
        console.error(e);
        return res.status(ldapError(e).code).send({ok: false, error: ldapError(e).msg});
    }
};
