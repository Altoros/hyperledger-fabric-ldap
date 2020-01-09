const path = require('path');
const express = require('express');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { log, checkJWT } = require('./helper');

// setting for self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { PORT = 3000, ORG = 'example' } = process.env;

const html = require('./html');
const connectToMongo = require('./database');

const loginHandler = require('./handlers/login');
const logoutHandler = require('./handlers/logout');
const changePasswordHandler = require('./handlers/change-password');
const changeUserPublicKeyHandler = require('./handlers/change-user-public-key');
const getUserPublicKeyHandler = require('./handlers/get-user-public-key');

const guaranteesHandler = require('./handlers/guarantees');
const guaranteeHandlers = require('./handlers/guarantee');
const receiverHandlers = require('./handlers/receivers');

const retry = async (method, n) => {
  try {
    await method();
    return null;
  } catch (e) {
    if (n === 0) {
      if (e.message) {
        console.error(e);
        throw e.message;
      }
      throw e;
    }
    console.warn('retry', n);
    await new Promise(resolve => setTimeout(() => resolve(), 750));
    return retry(method, n - 1);
  }
};

const init = async () => {
  try {
    await retry(connectToMongo, 5);
    console.info('Connected to database');
  } catch (e) {
    console.error(e);
  }

  const app = express();
  const router = express.Router();

  app.use(express.static(path.join(__dirname, '../dist/client')));

  router.use(cookieParser());
  router.use(bodyParser.json({ limit: '15mb' }));
  router.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));

  router.post('/login', loginHandler);
  router.post('/logout', logoutHandler);

  const renderer = async (req, res) => {
    const data = { org: ORG, user: await checkJWT(req, res) };
    // const data = { org: ORG, user: null };
    return res.send(html(data));
  };

  router.use('/api/*', async (req, res, next) => {
    try {
      const checkedJWT = await checkJWT(req, res);
      if (checkedJWT) {
        req.user = checkedJWT;
        return next();
      }
      return res.status(401).send({
        error:
          'Не хвататет прав, обновите страницу или свяжитесь с системным администратором.'
      });
    } catch (e) {
      console.error(e);
      return res.status(401).send({ error: e.message });
    }
  });

  router.get('/api/guarantees', guaranteesHandler);

  router.post('/api/changePassword', changePasswordHandler);

  router.post('/api/changeUserPublicKey', changeUserPublicKeyHandler);

  router.get('/api/getUserPublicKey', getUserPublicKeyHandler);

  guaranteeHandlers.concat(receiverHandlers).forEach(route => {
    router[route.method](route.path, async (req, res) => {
      const actor = req.user.user_info.full_name
        ? req.user.user_info.full_name
        : ORG;
      try {
        const data = await route.handler(req, res);
        if (route.log) {
          await log(route.log, actor, {
            success: true,
            data
          });
        }
        res.status(200).send({ ok: true, data });
      } catch (e) {
        if (route.log) {
          await log(route.log, actor, {
            success: false,
            error: e.message
          });
        }
        res.status(400).send({ error: e.message });
      }
    });
  });

  router.use('*', renderer);
  app.use(router);

  app.listen(PORT, () => {
    console.info(`listening on port: ${PORT}`);
  });
};

init();
