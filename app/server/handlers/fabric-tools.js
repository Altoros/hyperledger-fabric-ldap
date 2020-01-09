// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const {FileSystemWallet, X509WalletMixin, Gateway} = require('fabric-network');
const path = require('path');
var log4js = require('log4js');
var logger = log4js.getLogger('DEMOFabricApi-Tools');

const artifacts = path.resolve(__dirname, '../../artifacts');

const {
    ORG = 'example',
    DOMAIN = 'example.com'
} = process.env;

const options = async () => {
    try {
        const identityLabel = 'User1';
        // Identity to credentials to be stored in the wallet
        const credPath = path.join(artifacts, `/crypto-config/peerOrganizations/${ORG}.${DOMAIN}/users/${identityLabel}@${ORG}.${DOMAIN}`);
        const cert = fs.readFileSync(path.join(credPath, `/msp/signcerts/${identityLabel}@${ORG}.${DOMAIN}-cert.pem`)).toString();
        const key = fs.readFileSync(path.join(credPath, '/msp/keystore/server.key')).toString();

        // Load credentials into wallet
        const identity = X509WalletMixin.createIdentity(`${ORG}MSP`, cert, key);
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        logger.debug(`Wallet path: ${walletPath}`);

        await wallet.import(identityLabel, identity);

        return {
            success: true,
            value: {
                identity: identityLabel,
                wallet: wallet,
                discovery: {enabled: false, asLocalhost: true}
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
        const configPath = path.join(artifacts, '/api-configs/network-config.yaml');
        let fileContent = fs.readFileSync(configPath, 'utf8');

        return {
            success: true,
            value: yaml.safeLoad(fileContent)
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
        const configPath = path.join(artifacts, '/api-configs/network-config.yaml');
        let fileContent = fs.readFileSync(configPath, 'utf8');

        const connectionProfile = yaml.safeLoad(fileContent);

        let channels = [];
        let inParticipiants;
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
                    chaincode: channel.chaincodes[0],
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

module.exports = {options, profile, channelsByParticipiants};
