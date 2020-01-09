import { useEffect, useState } from 'react';
import { get } from '../utils/api';

export const useGet = url => {
  const [reload, setReload] = useState(false);

  const [req, setReq] = useState({
    loading: true,
    data: null,
    error: null
  });

  useEffect(() => {
    setReq({
      ...req,
      loading: true
    });
    get(url)
      .then(async res => {
        const data = await res.json();
        if (data.ok) {
          setReq({
            loading: false,
            data: data.data,
            error: null
          });
        } else {
          setReq({
            loading: false,
            data: null,
            error: data.error
          });
        }
      })
      .catch(e => {
        setReq({
          loading: false,
          data: null,
          error: e.message
        });
      });
  }, [reload]);

  return [
    req,
    setReq,
    () => {
      setReload(!reload);
    }
  ];
};

export const post = () => {};
