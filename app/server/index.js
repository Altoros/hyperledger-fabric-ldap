const path = require('path');
const express = require('express');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const {checkJWT, isProduction} = require('./helper');

const {PORT = 3000, ORG = 'example'} = process.env;

const html = require('./html');

const loginHandler = require('./handlers/login');
const logoutHandler = require('./handlers/logout');
const changePasswordHandler = require('./handlers/change-password');
const demoHandlers = require('./handlers/demo');

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

    const app = express();
    const router = express.Router();

    app.use(express.static(path.join(__dirname, '../dist/client')));

    router.use(cookieParser());
    router.use(bodyParser.json({limit: '15mb'}));
    router.use(bodyParser.urlencoded({limit: '15mb', extended: true}));

    router.post('/login', loginHandler);
    router.post('/logout', logoutHandler);

    const renderer = async (req, res) => {
        const data = {org: ORG, user: await checkJWT(req, res)};
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
                    'You haven\'t access. Update a page or connect with system administrator.'
            });
        } catch (e) {
            console.error(e);
            return res.status(401).send({error: e.message});
        }
    });

    router.post('/api/changePassword', changePasswordHandler);

    demoHandlers.forEach(route => {
        router[route.method](route.path, async (req, res) => {
            try {
                const data = await route.handler(req, res);
                res.status(200).send({ok: true, data});
            } catch (e) {
                res.status(400).send({error: e.message});
            }
        });
    });

    router.use('*', renderer);
    app.use(router);

    app.listen(PORT, () => {
        console.info(`listening on port: ${PORT}`);
        console.info(`server is running in ${isProduction() ? 'production' : 'development'} mode`)
    });
};

init();
