// Bring key classes into scope, most importantly Fabric SDK network class
const {Gateway} = require('fabric-network');
const log4js = require('log4js');

const logger = log4js.getLogger('DEMOFabricApi-Query');
const {options, profile} = require('./fabric-tools');

const query = async (channel, chaincode, fcn, args, user = 'admin') => {
    try {
        const connectionProfile = await profile();

        // Set connection options; identity and wallet
        const connectionOptions = await options(user);

        // Connect to gateway using application specified parameters
        const gateway = new Gateway();
        if (connectionProfile.success && connectionOptions.success) {
            await gateway.connect(connectionProfile.value, connectionOptions.value);
        }

        const network = await gateway.getNetwork(channel);
        const contract = await network.getContract(chaincode, '');

        logger.debug('Evaluate query transaction.');
        const response = await contract.evaluateTransaction(fcn, args.toString());
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
