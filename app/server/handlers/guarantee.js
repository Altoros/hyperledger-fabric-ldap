const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const sha256 = require('js-sha256');
const EC = require('elliptic').ec;

const { getUserPublicKey } = require('../helper');
const { decrypt } = require('./encryption');

const { DEFAULT_HLF_CHANNEL, DEFAULT_HLF_CHAINCODE } = process.env;

// setting for self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { signMessage } = require('../../common');

const guaranteeSchema = require('../database/schemas/guarantee');

const {invoke} = require('../handlers/invoke');
const {query} = require('../handlers/query');
const {channelsByParticipiants} = require('../handlers/fabric-tools');

const guaranteesTable = mongoose.model('guarantees', guaranteeSchema);

const RECEIVERS_ARTIFACTS_PATH = path.resolve(
  __dirname,
  '../',
  '../',
  'artifacts/',
  'api-configs/',
  './receivers.json'
);

const actionToNextStatusMap = {
  // 'issue-draft-rollback-to-editing': 0,
  // 'issue-draft-send-to-confirm': 1,
  // 'issue-draft-confirm': 2,
  'issue-guarantee-send': 4,
  'issued-guarantee-closure': 5,
  'closure-draft-rollback-to-editing': 5,
  // 'closure-draft-send-to-confirm': 6,
  // 'closure-draft-confirm': 7,
  'closure-guarantee-send': 9
};

const editGuaranteeDraft = [
  'issue-draft-edit',
  'issued-guarantee-edit-meta',
  'closure-draft-edit',
  'closed-guarantee-edit-meta'
];

const deleteGuaranteeDraft = ['issue-draft-delete'];

const update = async (id, document) => {
  return guaranteesTable.findByIdAndUpdate(
    id,
    Object.assign(
      {
        last_updated: new Date()
      },
      document
    ),
    {
      runValidators: true
    }
  );
};

const findReceiverById = id => {
  const receivers = fs.readFileSync(RECEIVERS_ARTIFACTS_PATH);
  return JSON.parse(receivers).find(i => i.id === id);
};

const methods = [
  {
    method: 'get',
    path: '/api/guarantee/:id',
    handler: async req => {
      if (
        req.user.user_info.permissions.includes('draft-view') ||
        req.user.user_info.permissions.includes('issued-guarantee-view') ||
        req.user.user_info.permissions.includes('closed-guarantee-view')
      ) {
        const { id } = req.params;
        const {  issuer, receiver, type } = req.query;
        const localGuarantee = await guaranteesTable.findById(id);

        if (type === 'cc') {
          const fcn = `get`;
          const args = [id];
          const channels = await channelsByParticipiants([issuer, receiver]);
          let results = [];
          if(!channels.success){
            throw new Error(channels.value);
          }
          for (const channel of channels.value) {
            const result = await query(
                channel.name,
                channel.chaincode,
                fcn,
                args
            );
            results.push(result)
          };

          let ccGuarantee;
          results.forEach((result) => {
            if(!result.success){
              throw new Error(result.message);
            }
            ccGuarantee = JSON.parse(result.message);
          });

          const receiversFile = fs.readFileSync(RECEIVERS_ARTIFACTS_PATH);
          const receivers = JSON.parse(receiversFile);

          const getGuaranteeDetails = guarantee => {
            const details = JSON.parse(guarantee.details);
            return {
              details_of_guarantee: details[0],
              details_of_guarantee_additional_1: details[1],
              details_of_guarantee_additional_2: details[2]
            };
          };

          const guaranteesWithMeta = Object.assign(
            {},
            ccGuarantee,
            {
              _id: ccGuarantee.id,
              // details_of_guarantee: ccGuarantee.details,
              receiver: receivers.find(i => i.id === ccGuarantee.receiver),
              sender_to_receiver_information: ccGuarantee.message
            },
            getGuaranteeDetails(ccGuarantee),
            localGuarantee
              ? {
                  closure_draft_issued: localGuarantee.status === 5,
                  closure_status: localGuarantee.closure_status,
                  comment_to_closure: localGuarantee.comment_to_closure
                }
              : {}
          );

          return guaranteesWithMeta;
        }

        return localGuarantee;
      }
      throw new Error('Не хвататет прав');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/issue-draft-rollback-to-editing',
    log: 'issue-draft-rollback-to-editing',
    handler: async req => {
      if (
        req.user.user_info.permissions.includes(
          'issue-draft-rollback-to-editing'
        )
      ) {
        const { _id } = req.body;

        return update(_id, {
          $set: { status: 0 },
          $unset: { sent_to_confirm_by: '', confirmed_by: '', signed_by: '' }
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/closure-draft-rollback-to-editing',
    log: 'closure-draft-rollback-to-editing',
    handler: async req => {
      if (
        req.user.user_info.permissions.includes(
          'closure-draft-rollback-to-editing'
        )
      ) {
        const { _id } = req.body;

        return update(_id, {
          $set: { status: 5 },
          $unset: { sent_to_confirm_by: '', confirmed_by: '', signed_by: '' }
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/issue-draft-entry',
    log: 'issue-draft-entry',
    handler: async req => {
      if (req.user.user_info.permissions.includes('issue-draft-entry')) {
        const guarantee = req.body;

        return guaranteesTable.create(
          Object.assign({}, guarantee, {
            status: 0,
            last_updated: new Date(),
            receiver: findReceiverById(guarantee.receiver)
          })
        );
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/verify-and-issue',
    log: 'verify-and-issue-guarantee',
    handler: async req => {
      const ec = new EC('secp256k1');
      // verify and update status
      const { _id } = req.body;
      const guarantee = await guaranteesTable.findById(_id);

      const signature = guarantee.signature;
      const userSign = guarantee.meta.userId;

      const publicKey = await getUserPublicKey({
        userId: userSign,
        password: decrypt(req.user.secret)
      });

      const hash = sha256.create();

      const nextStatus = 3;

      const msgHash = signMessage(guarantee, nextStatus);

      hash.update(msgHash);

      const pub = {
        x: publicKey[0].toString('hex'),
        y: publicKey[1].toString('hex')
      };
      const key = ec.keyFromPublic(pub, 'hex');
      const virified = key.verify(hash.array(), signature);
      if (!virified) {
        throw new Error('Signature verification failed');
      }

      const chaincodeGuarantee = Object.assign(
        {},
        JSON.parse(signMessage(guarantee, nextStatus)),
        {
          signature: JSON.stringify(guarantee.signature),
          signed_body: msgHash,
          date_of_closure: 0 // date of closure must be defaulted for issuance
        }
      );

      const fcn = 'issue';
      const args = [JSON.stringify(chaincodeGuarantee)];
      const channels = await channelsByParticipiants([guarantee.issuer, guarantee.receiver.id]);
      let results = [];
      if(!channels.success){
        throw new Error(channels.value);
      }
      for (const channel of channels.value) {
        const result = await invoke(
            channel.name,
            channel.chaincode,
            fcn,
            args,
            req.user.user_info.full_name
        );
        results.push(result)
      }

      results.forEach((result) => {
        if(!result.success){
          throw new Error(result.message);
        }
      });

      return update(_id, {
        $set: { status: 4 },
        $unset: { sent_to_confirm_by: '', confirmed_by: '', signed_by: '' }
      });
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/verify-and-close',
    log: 'verify-and-close',
    handler: async req => {
      const ec = new EC('secp256k1');
      // verify and update status
      const { _id, date_of_closure } = req.body;
      const guarantee = await guaranteesTable.findById(_id);

      const signature = guarantee.signature;
      const userSign = guarantee.meta.userId;

      const publicKey = await getUserPublicKey({
        userId: userSign,
        password: decrypt(req.user.secret)
      });

      const hash = sha256.create();

      const signStatus = 8; // Draft closure signed status

      const msgHash = signMessage(guarantee, signStatus);

      hash.update(msgHash);

      const pub = {
        x: publicKey[0].toString('hex'),
        y: publicKey[1].toString('hex')
      };
      const key = ec.keyFromPublic(pub, 'hex');
      const virified = key.verify(hash.array(), signature);
      if (!virified) {
        throw new Error('Signature verification failed');
      }

      const chaincodeGuarantee = Object.assign(
        {},
        JSON.parse(signMessage(guarantee, signStatus)),
        {
          signature: JSON.stringify(guarantee.signature),
          signed_body: msgHash,
          date_of_closure
        }
      );

      const fcn = 'close';
      const args = [JSON.stringify(chaincodeGuarantee)];
      const channels = await channelsByParticipiants([guarantee.issuer, guarantee.receiver.id]);
      let results = [];
      if(!channels.success){
        throw new Error(channels.value);
      }
      for (const channel of channels.value) {
        const result = await invoke(
            channel.name,
            channel.chaincode,
            fcn,
            args,
            req.user.user_info.full_name
        );
        results.push(result)
      }

      results.forEach((result) => {
        if(!result.success){
          throw new Error(result.message);
        }
      });

      return update(_id, {
        status: 9,
        date_of_closure: new Date(date_of_closure)
      });
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/issue-draft-sign',
    log: 'issue-draft-sign',
    handler: async req => {
      if (req.user.user_info.permissions.includes('issue-draft-sign')) {
        const { _id, signature } = req.body;
        const user = req.user.user_info.full_name;
        return update(_id, {
          signature,
          meta: { userId: user },
          signed_by: user,
          status: 3
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/issue-draft-send-to-confirm',
    log: 'issue-draft-send-to-confirm',
    handler: async req => {
      if (
        req.user.user_info.permissions.includes('issue-draft-send-to-confirm')
      ) {
        const { _id } = req.body;
        return update(_id, {
          sent_to_confirm_by: req.user.user_info.full_name,
          status: 1
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/closure-draft-send-to-confirm',
    log: 'closure-draft-send-to-confirm',
    handler: async req => {
      if (
        req.user.user_info.permissions.includes('closure-draft-send-to-confirm')
      ) {
        const { _id } = req.body;
        return update(_id, {
          sent_to_confirm_by: req.user.user_info.full_name,
          status: 6
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/issue-draft-confirm',
    log: 'issue-draft-confirm',
    handler: async req => {
      if (req.user.user_info.permissions.includes('issue-draft-confirm')) {
        const { _id } = req.body;
        return update(_id, {
          confirmed_by: req.user.user_info.full_name,
          status: 2
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/closure-draft-confirm',
    log: 'closure-draft-confirm',
    handler: async req => {
      if (req.user.user_info.permissions.includes('closure-draft-confirm')) {
        const { _id } = req.body;
        return update(_id, {
          confirmed_by: req.user.user_info.full_name,
          status: 7
        });
      }
      throw new Error('Forbidden');
    }
  },
  {
    method: 'post',
    path: '/api/guarantee/closure-draft-sign',
    log: 'closure-draft-sign',
    handler: async req => {
      if (req.user.user_info.permissions.includes('closure-draft-sign')) {
        const { _id, signature } = req.body;
        return update(_id, {
          signature,
          meta: { userId: req.user.user_info.full_name },
          signed_by: req.user.user_info.full_name,
          status: 8
        });
      }
      throw new Error('Forbidden');
    }
  }
];

module.exports = methods
  .concat(
    Object.keys(actionToNextStatusMap).map(type => ({
      method: 'post',
      path: `/api/guarantee/${type}`,
      log: type,
      handler: async req => {
        if (req.user.user_info.permissions.includes(type)) {
          const { _id } = req.body;
          return update(_id, {
            status: actionToNextStatusMap[type]
          });
        }
        throw new Error('Forbidden');
      }
    }))
  )
  .concat(
    editGuaranteeDraft.map(type => ({
      method: 'post',
      path: `/api/guarantee/${type}`,
      log: type,
      handler: async req => {
        if (req.user.user_info.permissions.includes(type)) {
          const guarantee = req.body;
          return update(guarantee._id, guarantee);
        }
        throw new Error('Forbidden');
      }
    }))
  )
  .concat(
    deleteGuaranteeDraft.map(type => ({
      method: 'post',
      path: `/api/guarantee/${type}`,
      log: type,
      handler: async req => {
        if (req.user.user_info.permissions.includes(type)) {
          const { _id } = req.body;
          return guaranteesTable.findByIdAndRemove(_id);
        }
        throw new Error('Forbidden');
      }
    }))
  )
  .concat({
    method: 'post',
    path: '/api/guarantee/closure-draft-delete',
    log: 'closure-draft-delete',
    handler: async req => {
      if (req.user.user_info.permissions.includes('closure-draft-delete')) {
        const { _id } = req.body;
        return guaranteesTable.findByIdAndUpdate(_id, {
          $unset: {
            closure_status: '',
            comment_to_closure: '',
            sent_to_confirm_by: '',
            confirmed_by: '',
            signed_by: ''
          },
          $set: { date_of_closure: 0, status: 4 }
        });
      }
      throw new Error('Forbidden');
    }
  });
