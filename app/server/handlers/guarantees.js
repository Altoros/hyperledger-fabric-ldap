const mongoose = require('mongoose');

const {query} = require('../handlers/query');
const {channelsByParticipiants} = require('../handlers/fabric-tools');
const guaranteeSchema = require('../database/schemas/guarantee');

const guaranteesTable = mongoose.model('guarantees', guaranteeSchema);

const {
    ORG = 'example',
    DEFAULT_HLF_CHANNEL,
    DEFAULT_HLF_CHAINCODE
} = process.env;

module.exports = async (req, res) => {
    const {type} = req.query;
    try {
        if (type === 'drafts') {
            const guarantees = await guaranteesTable.find({
                status: {$nin: [4, 9]}
            });
            res.status(200).send({ok: true, data: guarantees});
        } else {
            const fcn = type;
            const args = [ORG];

            const channels = await channelsByParticipiants();
            if (!channels.success) {
                throw new Error(channels.value);
            }
            let guarantees = [];
            for (const channel of channels.value) {
                const result = await query(
                    channel.name,
                    channel.chaincode,
                    fcn,
                    args
                );
                if (!result.success) {
                    throw new Error(result.message);
                }
                guarantees.push(...JSON.parse(result.message));
            }

            try {
                const localGuarantees = await Promise.all(
                    guarantees.map(i => guaranteesTable.findById(i.id))
                );

                const foundGuarantees = localGuarantees.filter(i => i);

                let data = guarantees;
                if (foundGuarantees.length) {
                    data = guarantees.map(i =>
                        Object.assign({}, i, {
                            _id: i.id,
                            receiver: localGuarantees.find(j => j._id.toString() === i.id)
                                .receiver
                        })
                    );
                } else {
                    data = guarantees.map(i =>
                        Object.assign({}, i, {
                            _id: i.id,
                            receiver: {
                                id: i.receiver,
                                label: i.receiver
                            }
                        })
                    );
                }

                res.status(200).send({ok: true, data});
            } catch (e) {
                console.error(e);
                res.status(400).send({error: result});
            }
        }
    } catch (e) {
        console.error(e);
        res.status(400).send({error: e.message});
    }
};
