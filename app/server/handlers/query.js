// Bring key classes into scope, most importantly Fabric SDK network class
const {FileSystemWallet, X509WalletMixin, Gateway} = require('fabric-network');
var log4js = require('log4js');
var logger = log4js.getLogger('NSDFabricApi-Query');
const {options, profile} = require('./fabric-tools');

const query = async (channel, chaincode, fcn, args) => {
    try {
        let connectionProfile = await profile();

        // Set connection options; identity and wallet
        let connectionOptions = await options();

        // Connect to gateway using application specified parameters
        const gateway = new Gateway();
        if(connectionProfile.success && connectionOptions.success){
            await gateway.connect(connectionProfile.value, connectionOptions.value);
        }


        const network = await gateway.getNetwork(channel);
        const contract = await network.getContract(chaincode, '');

        logger.debug('Evaluate query transaction.');
        let response = await contract.evaluateTransaction(fcn, args.toString());
        logger.debug('Query transaction complete.');

        return {
            success: true,
            message: response.toString()
        };
    } catch (e) {
        logger.error(e);
        return {
            success: false,
            message: e.message
        };
    }
};

module.exports = {query};
