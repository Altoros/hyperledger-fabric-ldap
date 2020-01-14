// Bring key classes into scope, most importantly Fabric SDK network class
const FabricCAServices = require('fabric-ca-client');
const log4js = require('log4js');
const {defaultAttrs} = require('../helper');

const logger = log4js.getLogger('DEMOFabricApi-Enroll');
const {wallet, profile, options} = require('./fabric-tools');
const {X509WalletMixin, Gateway} = require('fabric-network');
const x509 = require('x509');

const {
    ORG = 'example',
    MSPID,
    DOMAIN = 'example.com'
} = process.env;

const enroll = async (user = 'admin', userpw = 'adminpw', attrs = defaultAttrs, reenroll =false) => {
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
        attrs = attrs.map((i) => {
            return {name: i}
        });
        if (!userExists) {
            ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);
            enrollment = await ca.enroll({enrollmentID: user, enrollmentSecret: userpw, attr_reqs: attrs});
            message = `Successfully enrolled user "${user}" and imported it into the wallet`;
        } else if(reenroll) {
            const connectionOptions = await options(user);
            // Connect to gateway using application specified parameters
            const gateway = new Gateway();
            if (connectionProfile.success && connectionOptions.success) {
                await gateway.connect(connectionProfile.value, connectionOptions.value);
            }
            ca = gateway.getClient().getCertificateAuthority();
            const currentIdentity = gateway.getCurrentIdentity();
            enrollment = await ca.reenroll(currentIdentity, attrs);
            message = `Successfully enrolled user "${user}" and imported it into the wallet`;
        } else {
            const connectionOptions = await options(user);
            // Connect to gateway using application specified parameters
            const gateway = new Gateway();
            if (connectionProfile.success && connectionOptions.success) {
                await gateway.connect(connectionProfile.value, connectionOptions.value);
            }
            message = `User "${user}" already enrolled and imported into the wallet`;
            logger.info(message);
            return {
                success: true,
                message
            };
        }
        const identity = X509WalletMixin.createIdentity(`${MSPID}`, enrollment.certificate, enrollment.key.toBytes());
        await appWallet.value.wallet.import(user, identity);
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
