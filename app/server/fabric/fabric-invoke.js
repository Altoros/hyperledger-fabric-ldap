// Bring key classes into scope, most importantly Fabric SDK network class
const {Gateway} = require('fabric-network');
const log4js = require('log4js');

const logger = log4js.getLogger('DEMOFabricApi-Invoke');
const {options, profile} = require('./fabric-tools');

const invoke = async (channel, chaincode, fcn, args, user = 'admin') => {
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

        logger.debug('Submit transaction.');

        const transaction = contract.createTransaction(fcn);
        await transaction.submit(...args);

        await transaction.addCommitListener((err, id, status, blockNumber) => {
            if (err) {
                throw new Error(err.message)
            }
            logger.debug(`TxID: ${id}, Status: ${status}, BlockNumber: ${blockNumber}`);
        });
        logger.debug('Transaction complete.');
        const message = `Successfully invoked the chaincode "${chaincode}". Transaction ID: "${transaction.getTransactionID().getTransactionID()}"`;
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

module.exports = {invoke};
