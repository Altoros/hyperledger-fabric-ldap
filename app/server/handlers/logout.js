const { checkJWT } = require('../helper');

module.exports = async (req, res) => {
  const checkedJWT = await checkJWT(req, res);
  if (checkedJWT) {
  }
  res.clearCookie('jwt', {
    httpOnly: true,
    domain: req.hostname
  });
  try {
    res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
};
