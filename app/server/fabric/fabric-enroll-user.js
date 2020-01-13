// Bring key classes into scope, most importantly Fabric SDK network class
const FabricCAServices = require('fabric-ca-client');
const log4js = require('log4js');
const {defaultAttrs} = require('../helper');

const logger = log4js.getLogger('DEMOFabricApi-Enroll');
const {wallet, profile, options} = require('./fabric-tools');
const {X509WalletMixin, Gateway} = require('fabric-network');

const {
    ORG = 'example',
    MSPID,
    DOMAIN = 'example.com'
} = process.env;

const enroll = async (user = 'admin', userpw = 'adminpw', attrs = defaultAttrs) => {
    try {
        const connectionProfile = await profile();
        const appWallet = await wallet();

        // Create a new CA client for interacting with the CA.
        const caInfo = connectionProfile.value.certificateAuthorities[`ca.${ORG}.${DOMAIN}`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;

        // Enroll the admin user, and import the new identity into the wallet.
        const userExists = await appWallet.value.wallet.exists(user);
        let enrollment;
        let ca;
        let message;
        if (!userExists) {
            ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);
            enrollment = await ca.enroll({enrollmentID: user, enrollmentSecret: userpw});
            message = `Successfully enrolled user "${user}" and imported it into the wallet`;
        } else {
            const connectionOptions = await options(user);
            // Connect to gateway using application specified parameters
            const gateway = new Gateway();
            if (connectionProfile.success && connectionOptions.success) {
                await gateway.connect(connectionProfile.value, connectionOptions.value);
            }
            ca = gateway.getClient().getCertificateAuthority();
            const currentIdentity = gateway.getCurrentIdentity();
            attrs = attrs.map((i) => {
                return {name: i}
            });
            enrollment = await ca.reenroll(currentIdentity, attrs);
            message = `Successfully enrolled user "${user}" and imported it into the wallet`;
        }
        const identity = X509WalletMixin.createIdentity(`${MSPID}`, enrollment.certificate, enrollment.key.toBytes());
        await appWallet.value.wallet.import(user, identity);
        logger.info(message);
        return {
            success: true,
            message,
            identity,
            enrollment
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
