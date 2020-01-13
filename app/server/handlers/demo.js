const {DEFAULT_HLF_CHANNEL, DEFAULT_HLF_CHAINCODE} = process.env;

// setting for self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const {invoke} = require('../fabric/fabric-invoke');
const {query} = require('../fabric/fabric-query');
const {enroll} = require('../fabric/fabric-enroll-user');
const {register} = require('../fabric/fabric-register-user');
const x509 = require('x509');

const methods = [
    {
        method: 'get',
        path: '/api/query/:id',
        handler: async req => {
            const {id} = req.params;
            const fcn = `query`;
            const args = [id];
            const user = req.user.user_info.full_name;
            const result = await query(
                DEFAULT_HLF_CHANNEL,
                DEFAULT_HLF_CHAINCODE,
                fcn,
                args,
                user
            );

            if (!result.success) {
                throw new Error(result.message);
            }
            return JSON.parse(result.message);
        }
    },
    {
        method: 'post',
        path: '/api/invoke',
        handler: async req => {
            const {fcn, args} = req.body;
            const user = req.user.user_info.full_name;
            const result = await invoke(
                DEFAULT_HLF_CHANNEL,
                DEFAULT_HLF_CHAINCODE,
                fcn,
                args,
                user
            );
            if (!result.success) {
                throw new Error(result.message);
            }
            return result.message;
        }
    },
    {
        method: 'post',
        path: '/api/enroll',
        handler: async req => {
            const {username, password} = req.body;
            const user = req.user.user_info.full_name;
            let cert;
            const result = await enroll(username, password);
            if (result.success && result.identity && result.enrollment) {
                cert = x509.parseCert(result.enrollment.certificate);
            }
            else if (!result.success) throw new Error(result.message);

            return {cert};
        }
    },
    {
        method: 'post',
        path: '/api/register',
        handler: async req => {
            const {username, password} = req.body;
            const registrar = req.user.user_info.full_name;
            let attrs = {
                affiliation: 'org1.department1',
                enrollmentID: username,
                role: 'client'
            };
            let cert;
            const result = await register(registrar, username, password, attrs);
            if (result.success && result.identity && result.enrollment) {
                cert = x509.parseCert(result.enrollment.certificate);
            }
            else if (!result.success) throw new Error(result.message);
            return {cert};
        }
    }
];

module.exports = methods;
