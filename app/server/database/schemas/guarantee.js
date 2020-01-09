/* eslint camelcase: 0 */
const mongoose = require('mongoose');

const validateEmptyString = {
  validator: value => {
    return value.length !== 0;
  },
  message: '{VALUE} is empty!'
};

const guaranteeSchema = mongoose.Schema(
  {
    type: {
      type: Number,
      required: true,
      default: 0
    },
    issuer: {
      type: String,
      required: [true, 'Отправитель - обязательное поле'],
      validate: validateEmptyString
    },
    receiver: {
      id: {
        type: String
      },
      label: {
        type: String
      }
    },
    beneficiary: {
      type: String,
      required: true
    },
    status: {
      type: Number,
      required: true,
      default: 0
    },
    date_of_issue: {
      type: Date,
      required: true
    },
    date_of_closure: {
      type: Date
    },
    date_of_expiration: {
      type: Date
    },
    applicable_rules: {
      type: String,
      required: [true, 'Правила регулирования - обязательное поле'],
      validate: validateEmptyString
    },
    details_of_guarantee: {
      type: String,
      required: [true, 'Текст гарантии - обязательное поле'],
      validate: validateEmptyString
    },
    details_of_guarantee_additional_1: {
      type: String
    },
    details_of_guarantee_additional_2: {
      type: String
    },
    sender_to_receiver_information: {
      type: String,
      required: false,
      default: ''
    },
    signature: {
      type: Object,
      required: false
    },
    comment_to_closure: {
      type: String
    },
    closure_status: {
      type: String
    },
    sent_to_confirm_by: {
      type: String
    },
    confirmed_by: {
      type: String
    },
    signed_by: {
      type: String
    },
    last_updated: {
      type: Date
    },
    meta: {
      userId: {
        type: String,
        required: false
      }
    }
  },
  {
    strict: true,
    versionKey: false
  }
);

module.exports = guaranteeSchema;
