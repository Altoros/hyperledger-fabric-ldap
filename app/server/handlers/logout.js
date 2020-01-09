const { log, checkJWT } = require('../helper');

module.exports = async (req, res) => {
  const checkedJWT = await checkJWT(req, res);
  let actor;
  if (checkedJWT) {
    actor = checkedJWT.user_info.full_name;
  }
  res.clearCookie('jwt', {
    httpOnly: true,
    domain: req.hostname
  });
  try {
    await log('logout', actor, { success: true });
    res.status(200).json({ success: true });
  } catch (e) {
    await log('logout', actor, { success: false, error: e.message });
    return res.status(500).send({ error: e.message });
  }
};
