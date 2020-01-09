// Bring key classes into scope, most importantly Fabric SDK network class
const {Gateway} = require('fabric-network');
const log4js = require('log4js');

const logger = log4js.getLogger('DEMOFabricApi-Event');
const Emitter = require('events');

const {options, profile} = require('./fabric-tools');

class EventEmitter extends Emitter {
}

const eventEmitter = new EventEmitter();

const blockEvent = async (channel, events = [], user = 'admin') => {
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

        await network.addBlockListener('event-block-listener', (err, block) => {
            if (err) {
                eventEmitter.emit('error', err);
            }
            block.data.data.forEach((data) => {
                data.payload.data.actions.forEach((action) => {
                    const payload = action.payload;
                    const event = payload.action.proposal_response_payload.extension.events;
                    const eventName = event.event_name;
                    const encodedEventPayload = event.payload;
                    const decodedEventPayload = encodedEventPayload ? Buffer.from(encodedEventPayload).toString() : '';
                    if (events.includes(eventName)) {
                        logger.info(`EventName: ${eventName}`);
                        logger.info(`EventPayloadDecoded: ${JSON.stringify(decodedEventPayload)}`);
                        eventEmitter.emit(eventName, decodedEventPayload);
                    }
                });
            });
        });
        return {
            success: true
        };
    } catch (e) {
        return {
            success: false,
            message: e.message
        };
    }
};

const contractEvent = async (channel, chaincode, events = [], user = 'admin') => {
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
        const contract = network.getContract(chaincode);

        events.forEach(async (eventName) => {
            await contract.addContractListener(`${eventName}-contract-listener`, eventName, (err, event, blockNumber, transactionId, status) => {
                if (err) {
                    eventEmitter.emit('error', err);
                }
                const encodedEventPayload = event.payload;
                const decodedEventPayload = encodedEventPayload ? Buffer.from(encodedEventPayload).toString() : '';
                eventEmitter.emit(eventName, decodedEventPayload, blockNumber, transactionId, status);
            });
        });
        return {
            success: true
        };
    } catch (e) {
        return {
            success: false,
            message: e.message
        };
    }
};

module.exports = {blockEvent, contractEvent, eventEmitter};
