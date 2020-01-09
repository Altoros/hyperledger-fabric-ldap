/* eslint camelcase: 0 */

module.exports = {
  signMessage: (guarantee, status) =>
    JSON.stringify({
      type: guarantee.type,
      applicable_rules: guarantee.applicable_rules,
      receiver: guarantee.receiver.id,
      beneficiary: guarantee.beneficiary,
      date_of_issue: new Date(guarantee.date_of_issue).getTime(),
      date_of_expiration: new Date(guarantee.date_of_expiration).getTime(),
      details: JSON.stringify([
        guarantee.details_of_guarantee,
        guarantee.details_of_guarantee_additional_1,
        guarantee.details_of_guarantee_additional_2
      ]),
      id: guarantee._id,
      issuer: guarantee.issuer,
      message: guarantee.sender_to_receiver_information,
      status
    })
};
