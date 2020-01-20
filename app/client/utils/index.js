const dates = ['date_of_closure', 'date_of_expiration', 'date_of_issue'];
// eslint-disable-next-line import/prefer-default-export
export const sort = (field, direction, data) => {
  const sorted = data.concat([]);
  if (field === 'status') {
    if (direction === 'ascending') {
      sorted.sort((i, j) => i[field] - j[field]);
    } else {
      sorted.reverse();
    }
  }

  if (dates.includes(field)) {
    if (direction === 'ascending') {
      sorted.sort((i, j) => new Date(i[field]) - new Date(j[field]));
    } else {
      sorted.reverse();
    }
  }

  return sorted;
};
