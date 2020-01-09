var log4js = require('log4js');
var logger = log4js.getLogger('LdapErrorHandler');
module.exports = (error) => {
    let msg = undefined;
    let code = 500;
    let pwdMustChange = false;
    if (error.name === 'InvalidCredentialsError') {
        code = 401;
        msg = 'Введен неверный логин или пароль';
    } else if (error.name === 'InsufficientAccessRightsError') {
        code = 401;
        pwdMustChange = true;
    } else if (error.name === 'ConstraintViolationError') {
        code = 422;
        msg = `Новый пароль не соответствует требованиям политики безопасности`;
        pwdMustChange = true;
    } else if (error.name === 'NewPasswordValidationError') {
        code = 422;
        msg = error.message;
        pwdMustChange = true;
    } else {
        code = 500;
        msg = `Внутренняя ошибка сервера`;
        logger.error(error);
    }
    return {
        msg: msg,
        code: code,
        pwdMustChange: pwdMustChange
    }
};
