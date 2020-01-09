// Bring key classes into scope, most importantly Fabric SDK network class
const {FileSystemWallet, X509WalletMixin, Gateway} = require('fabric-network');
var log4js = require('log4js');
var logger = log4js.getLogger('DEMOFabricApi-Invoke');
const {log} = require('../helper');
const {options, profile} = require('./fabric-tools');

const {
    ORG = 'example'
} = process.env;

const invoke = async (channel, chaincode, fcn, args, actor = ORG) => {
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

        logger.debug('Submit transaction.');
        args = JSON.parse(args); // validation JSON before making invoke

        const transaction = contract.createTransaction(fcn);
        await transaction.submit(JSON.stringify(args));

        await transaction.addCommitListener((err, id, status, blockNumber) => {
            if (err) {
                throw new Error(err.message)
            }
            logger.debug(`TxID: ${id}, Status: ${status}, BlockNumber: ${blockNumber}`);
        });
        logger.debug('Transaction complete.');
        let message = `Successfully invoked the chaincode "${chaincode}". Transaction ID: "${transaction.getTransactionID().getTransactionID()}"`;
        logger.info(message);
        await log('invoke-chaincode', actor, {
            success: true,
            chaincode_function: fcn,
            chaincode_args: args,
            message: message
        });
        return {
            success: true,
            message: message
        };
    } catch (e) {
        logger.error(e);
        await log('invoke-chaincode', actor, {
            success: false,
            chaincode_function: fcn,
            chaincode_args: args,
            message: e.message
        });
        return {
            success: false,
            message: e.message
        };
    }
};

module.exports = {invoke};
