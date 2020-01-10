// Bring key classes into scope, most importantly Fabric SDK network class
const FabricCAServices = require('fabric-ca-client');
const log4js = require('log4js');

const logger = log4js.getLogger('DEMOFabricApi-Enroll');
const {wallet, profile} = require('./fabric-tools');

const {
    ORG = 'example',
    DOMAIN = 'example.com'
} = process.env;

const enroll = async (user = 'admin', userpw = 'adminpw') => {
    try {
        const connectionProfile = await profile();
        const appWallet = await wallet();

        // Create a new CA client for interacting with the CA.
        const caInfo = connectionProfile.certificateAuthorities[`ca.${ORG}.${DOMAIN}`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({enrollmentID: user, enrollmentSecret: userpw});
        const identity = X509WalletMixin.createIdentity(`${ORG}MSP`, enrollment.certificate, enrollment.key.toBytes());
        await appWallet.import(user, identity);
        const message = 'Successfully enrolled admin user "admin" and imported it into the wallet';
        logger.info(message);
        return {
            success: true,
            message
        };
    } catch (e) {
        logger.error(e);
        return {
            success: false,
            message: e.message
        };
    }
};

module.exports = {enroll};
