const {DEFAULT_HLF_CHANNEL, DEFAULT_HLF_CHAINCODE} = process.env;

// setting for self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const {invoke} = require('../fabric/fabric-invoke');
const {query} = require('../fabric/fabric-query');

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
    }
];

module.exports = methods;
