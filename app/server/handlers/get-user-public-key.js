const ldapError = require('./ldap-error');

const { log, getUserPublicKey } = require('../helper');

const { decrypt } = require('./encryption');

const { ORG } = process.env;

module.exports = async (req, res) => {
  const actor = req.user.user_info.full_name
    ? req.user.user_info.full_name
    : ORG;
  try {
    const publicKey = await getUserPublicKey({
      userId: req.user.user_info.full_name,
      password: decrypt(req.user.secret)
    });
    await log('get-user-public-key', actor, {
      success: true,
      publicKey
    });
    return res.status(200).send({ ok: true, publicKey });
  } catch (e) {
    console.error(e);
    await log('get-user-public-key', actor, {
      success: false,
      error: e.message
    });
    return res
      .status(ldapError(e).code)
      .send({ ok: false, error: ldapError(e).msg });
  }
};
