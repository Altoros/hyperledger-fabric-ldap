// eslint-disable-next-line import/prefer-default-export
export const form = (state, payload) => {
  const { type, field, value } = payload;

  switch (type) {
    case 'CHANGE_TEXT_INPUT':
      return {
        ...state,
        [field]: value,
        touched: {
          ...state.touched,
          [field]: true
        }
      };
    case 'RESET':
      return payload.state;
    default:
      return state;
  }
};
