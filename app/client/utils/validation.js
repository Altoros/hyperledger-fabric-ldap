// eslint-disable-next-line import/prefer-default-export
export const validateForm = values => {
  const errors = {};
  if (values.touched.receiver && values.receiver.length === 0) {
    errors.receiver = 'Введите получателя';
  }
  if (values.touched.beneficiary && values.beneficiary.length === 0) {
    errors.beneficiary = 'Введите бенефициара';
  }
  if (values.touched.details_of_guarantee && values.details_of_guarantee.length === 0) {
    errors.details_of_guarantee = 'Введите текст гарантии';
  }
  if (values.touched.applicable_rules && values.applicable_rules.length === 0) {
    errors.applicable_rules = 'Введите правила регулирования';
  }

  return errors;
};
