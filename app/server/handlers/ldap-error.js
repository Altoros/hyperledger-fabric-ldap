var log4js = require('log4js');
var logger = log4js.getLogger('LdapErrorHandler');
module.exports = (error) => {
    let msg = undefined;
    let code = 500;
    let pwdMustChange = false;
    if (error.name === 'InvalidCredentialsError') {
        code = 401;
        msg = 'Wrong username or password entered';
    } else if (error.name === 'InsufficientAccessRightsError') {
        code = 401;
        pwdMustChange = true;
    } else if (error.name === 'ConstraintViolationError') {
        code = 422;
        msg = `New password does not meet security policy requirements`;
        pwdMustChange = true;
    } else if (error.name === 'NewPasswordValidationError') {
        code = 422;
        msg = error.message;
        pwdMustChange = true;
    } else {
        code = 500;
        msg = `Internal Server Error`;
        logger.error(error);
    }
    return {
        msg: msg,
        code: code,
        pwdMustChange: pwdMustChange
    }
};
