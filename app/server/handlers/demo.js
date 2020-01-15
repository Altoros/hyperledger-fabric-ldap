const {DEFAULT_HLF_CHANNEL, DEFAULT_HLF_CHAINCODE} = process.env;
const path = require('path');
const fs = require('fs');

const {invoke} = require('../fabric/fabric-invoke');
const {query} = require('../fabric/fabric-query');
const {enroll} = require('../fabric/fabric-enroll-user');
const {register} = require('../fabric/fabric-register-user');
const {options, profile} = require('../fabric/fabric-tools');
const {listDirectory, isProduction} = require('../helper');
const {fakeIdentities} = require('../fakeData');
const {Gateway} = require('fabric-network');

const {
    ORG = 'example'
} = process.env;

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
        method: 'get',
        path: '/api/identities',
        handler: async req => {
            const walletPath = path.join(process.cwd(), 'wallet');
            let fullListIdentities = [];
            let listIdentities = [];
            let listOrgs;
            let identities = fakeIdentities;
            if (isProduction()) {
                identities = [];
                try {
                    listOrgs = await listDirectory(walletPath);
                } catch (e) {
                    throw e;
                }
                for (org of listOrgs) {
                    try {
                        listIdentities = await listDirectory(path.join(walletPath, path.basename(org)));
                    } catch (e) {
                        throw e;
                    }
                    fullListIdentities.push(...listIdentities)
                }
                for (label of fullListIdentities) {
                    let name = path.basename(label);
                    let identity = JSON.parse(fs.readFileSync(path.join(label, name), 'utf8'));
                    identities.push(identity);
                }
            }
            return identities;
        }
    },
    {
        method: 'get',
        path: '/api/identity',
        handler: async req => {
            let identity = fakeIdentities[0];
            const user = req.user.user_info.full_name;
            if (isProduction()) {
                const connectionProfile = await profile();
                const connectionOptions = await options(user);
                // Connect to gateway using application specified parameters
                const gateway = new Gateway();
                if (connectionProfile.success && connectionOptions.success) {
                    await gateway.connect(connectionProfile.value, connectionOptions.value);
                }
                identity = gateway.getCurrentIdentity();
                const contentWallet = await connectionOptions.value.wallet.list();

                return [
                    {
                        "name": identity.getName(),
                        "mspid": identity.getIdentity().getMSPId(),
                        "roles": identity.getRoles(),
                        "affiliation": identity.getAffiliation(),
                        "enrollment": {
                            "signingIdentity": contentWallet.map(i => i.label === user ? i.identifier : ''),
                            "identity": {
                                "certificate": identity.getIdentity()._certificate
                            }
                        }
                    }
                ]

            }
            return identity;
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
            const {username, password, attrs} = req.body;
            const result = await enroll(username, password, attrs, true);
            let cert;
            if (result.success && result.identity && result.enrollment) {
                cert = result.cert;
            } else if (!result.success) throw new Error(result.message);

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
            if (result.success && result.identity && result.cert) {
                cert = result.cert;
            } else if (!result.success) throw new Error(result.message);
            return {cert};
        }
    }
];

module.exports = methods;
