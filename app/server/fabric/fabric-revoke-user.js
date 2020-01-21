// Bring key classes into scope, most importantly Fabric SDK network class
const log4js = require('log4js');
const {Gateway} = require('fabric-network');

const logger = log4js.getLogger('DEMOFabricApi-Enroll');
const {wallet, profile, options} = require('./fabric-tools');
const {X509WalletMixin} = require('fabric-network');

const {
    MSPID,
} = process.env;

const revoke = async (enrollmentId, enrollmentId) => {
    try {
        const connectionOptions = await options(registrar);
        const connectionProfile = await profile();
        const appWallet = await wallet();

        // Connect to gateway using application specified parameters
        const gateway = new Gateway();
        if (connectionProfile.success && connectionOptions.success) {
            await gateway.connect(connectionProfile.value, connectionOptions.value);
        }

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const registrarIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        await ca.revoke({enrollmentID: enrollmentId}, registrarIdentity);
        const message = `Successfully revoke identity: ${enrollmentId}`;

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

module.exports = {revoke};
