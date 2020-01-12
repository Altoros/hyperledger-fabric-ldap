// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const {FileSystemWallet, X509WalletMixin} = require('fabric-network');
const path = require('path');
var log4js = require('log4js');
var logger = log4js.getLogger('DEMOFabricApi-Tools');

const firstNetwork = path.resolve(__dirname, '../../first-network');

const {
    ORG = 'example',
    DOMAIN = 'example.com',
    MSPID,
    USE_CA = 1
} = process.env;

const options = async (identityLabel = 'User1') => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        logger.debug(`Wallet path: ${walletPath}`);
        // Check to see if we've already imported the identity.
        const userExists = await wallet.exists(identityLabel);
        if (!userExists) {
            if (!USE_CA) {
                // Identity to credentials to be stored in the wallet
                const credPath = path.join(firstNetwork, `/crypto-config/peerOrganizations/${ORG}.${DOMAIN}/users/${identityLabel}@${ORG}.${DOMAIN}`);
                const cert = fs.readFileSync(path.join(credPath, `/msp/signcerts/${identityLabel}@${ORG}.${DOMAIN}-cert.pem`)).toString();
                const key = fs.readFileSync(path.join(credPath, '/msp/keystore/server.key')).toString();
                // Load credentials into wallet
                const identity = X509WalletMixin.createIdentity(`${MS}`, cert, key);
                await wallet.import(identityLabel, identity);
            } else {
                const message = `An identity for the user "${identityLabel}" does not exist in the wallet`;
                throw new Error(message);
            }
        }
        return {
            success: true,
            value: {
                identity: identityLabel,
                wallet,
                discovery: {enabled: true, asLocalhost: false}
            }
        };
    } catch (e) {
        logger.error(e);
        return {
            success: false,
            value: e.message
        };
    }
};

const wallet = async () => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        logger.debug(`Wallet path: ${walletPath}`);
        return {
            success: true,
            value: {
                wallet
            }
        };
    } catch (e) {
        logger.error(e);
        return {
            success: false,
            value: e.message
        };
    }
};

const profile = async () => {
    try {
        const configPath = path.join(firstNetwork, `/connection-${ORG}.json`);
        let fileContent = fs.readFileSync(configPath, 'utf8');


        // adjust config app host configuration
        //ca
        fileContent = fileContent.split("localhost:7054").join(`ca.org1.example.com:7054`);
        fileContent = fileContent.split("localhost:8054").join(`ca.org2.example.com:8054`);
        //peer
        fileContent = fileContent.split("localhost:7051").join(`peer0.org1.example.com:7051`);
        fileContent = fileContent.split("localhost:8051").join(`peer1.org1.example.com:8051`);
        fileContent = fileContent.split("localhost:9051").join(`peer0.org2.example.com:9051`);
        fileContent = fileContent.split("localhost:10051").join(`peer1.org2.example.com:10051`);

        return {
            success: true,
            value: JSON.parse(fileContent)
        };
    } catch (e) {
        logger.error(e);
        return {
            success: false,
            value: e.message
        };
    }
};

const channelsByParticipiants = async (participiants = [ORG]) => {
    try {
        const configPath = path.join(firstNetwork, `/connection-${ORG}.yaml`);
        const fileContent = fs.readFileSync(configPath, 'utf8');

        const connectionProfile = yaml.safeLoad(fileContent);

        const channels = [];
        let inParticipiants;
        // eslint-disable-next-line no-restricted-syntax
        for (const channel of connectionProfile.application.channels) {
            inParticipiants = true;
            participiants.forEach((member) => {
                if (!channel.participiants.includes(member)) {
                    inParticipiants = false;
                }
            });
            if (inParticipiants) {
                channels.push({
                    name: channel.name,
                    chaincode: channel.chaincodes[0]
                })
            }
        }
        return {
            success: true,
            value: channels
        };
    } catch (e) {
        logger.error(e);
        return {
            success: false,
            value: e.message
        };
    }
};

module.exports = {options, profile, channelsByParticipiants, wallet};
