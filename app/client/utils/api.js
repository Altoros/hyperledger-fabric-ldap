import fetch from 'isomorphic-fetch';

const retry = (url, options, n) =>
  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response;
    })
    .catch(error => {
      if (n === 0) {
        if (error.message) {
          console.error(error);
          throw error.message;
        }
        throw error;
      }
      console.warn('retry');
      return retry(url, options, n - 1);
    });

const request = (url, method, data) =>
  fetch(
    `${url}`,
    Object.assign(
      { method },
      data
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }
        : {}
    )
  );

export const post = (url, data) => request(url, 'post', data);

export const put = (url, data) => request(url, 'put', data);

export const remove = (url, data) => request(url, 'delete', data);

export const get = url => request(url, 'get');

export const updateGuarantee = async (action, payload) => {
  try {
    const [err, result] = await post(`/api/guarantee/${action}`, payload).then(
      async res => [!res.ok, await res.json()]
    );

    if (err) {
      return [result.error];
    }

    return [null, 'Сохранено успешно'];
  } catch (e) {
    console.error(e);
    return [e.message];
  }
};
