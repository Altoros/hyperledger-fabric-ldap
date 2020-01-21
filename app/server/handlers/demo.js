const {DEFAULT_HLF_CHANNEL, DEFAULT_HLF_CHAINCODE} = process.env;
const path = require('path');
const fs = require('fs');

const {invoke} = require('../fabric/fabric-invoke');
const {query} = require('../fabric/fabric-query');
const {enroll} = require('../fabric/fabric-enroll-user');
const {register} = require('../fabric/fabric-register-user');
const {options, profile} = require('../fabric/fabric-tools');
const {listDirectory, isProduction} = require('../helper');
const {fakeIdentities, fakeUnits} = require('../fakeData');
const {Gateway} = require('fabric-network');
const x509 = require('x509');

const {
    ORG = 'example'
} = process.env;

const methods = [
    {
        method: 'get',
        path: '/api/get/:id/:cn',
        handler: async req => {
            const {id, cn} = req.params;
            const fcn = `get`;
            const args = [id, cn];
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
        path: '/api/list',
        handler: async req => {
            const fcn = `list`;
            const args = [];
            const user = req.user.user_info.full_name;
            if (isProduction()) {
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
            return fakeUnits[0]
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
                try {
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
                        identity.decodedCertificate = x509.parseCert(identity.enrollment.identity.certificate);
                        identities.push(identity);
                    }
                } catch (e) {
                    throw e
                }

            }
            return identities;
        }
    },
    {
        method: 'get',
        path: '/api/identities/:id',
        handler: async req => {
            let result = fakeIdentities[0];
            const {id} = req.params;
            const walletPath = path.join(process.cwd(), 'wallet');
            let fullListIdentities = [];
            let listIdentities = [];
            let listOrgs;
            if (isProduction()) {
                try {

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
                        if (identity.enrollment.signingIdentity === id) {
                            identity.decodedCertificate = x509.parseCert(identity.enrollment.identity.certificate);
                            result = identity;
                        }
                    }
                } catch (e) {
                    throw e;
                }
            }
            return result;
        }
    },
    {
        method: 'post',
        path: '/api/decodex509',
        handler: async req => {
            const {certificate} = req.body;
            let decodedCert;
            try {
                decodedCert = x509.parseCert(fakeIdentities[0].enrollment.identity.certificate);
                if (isProduction()) {
                    decodedCert = x509.parseCert(certificate);
                }
            } catch (e) {
                throw e;

            }
            return decodedCert;
        }
    },
    {
        method: 'post',
        path: '/api/set',
        handler: async req => {
            const fcn = `set`;
            const args = [];
            const user = req.user.user_info.full_name;
            if (isProduction()) {
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
            return "Ok"
        }
    },
    {
        method: 'post',
        path: '/api/move',
        handler: async req => {
            const {x, id, cn} = req.body;
            const fcn = `move`;
            const args = [x, id, cn];
            const user = req.user.user_info.full_name;
            if (isProduction()) {
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
            return "Ok"
        }
    },
    {
        method: 'post',
        path: '/api/delete',
        handler: async req => {
            const {id, cn} = req.body;
            const fcn = `delete`;
            const args = [id, cn];
            const user = req.user.user_info.full_name;
            if (isProduction()) {
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
            return "Ok"
        }
    },
    {
        method: 'post',
        path: '/api/enroll',
        handler: async req => {
            const {username, password, attrs} = req.body;
            if (isProduction()) {
                const result = await enroll(username, password, attrs, true);
                let cert;
                if (result.success && result.identity && result.enrollment) {
                    cert = result.cert;
                } else if (!result.success) throw new Error(result.message);

                return {cert};
            }
            return fakeIdentities[0].enrollment.identity.certificate
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
            if (isProduction()) {
                let cert;
                const result = await register(registrar, username, password, attrs);
                if (result.success && result.identity && result.cert) {
                    cert = result.cert;
                } else if (!result.success) throw new Error(result.message);
                return {cert};
            }
            return fakeIdentities[0].enrollment.identity.certificate
        }
    }
];

module.exports = methods;
