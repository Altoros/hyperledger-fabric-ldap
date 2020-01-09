import React, { useCallback, useState } from 'react';
import { Button, Modal } from 'semantic-ui-react';

import { useDropzone } from 'react-dropzone';
import { ec as EC } from 'elliptic';
import sha256 from 'js-sha256';

import { signMessage } from '../../common/index';

const Dropzone = ({ selectedKey, setKey }) => {
  const onDrop = useCallback(acceptedFiles => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      setKey(JSON.parse(event.target.result));
    };
    fileReader.readAsText(acceptedFiles[0]);
    // Do something with the files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/json'
  });

  return (
    <div {...getRootProps()}>
      {!selectedKey ? (
        <div
          style={{
            cursor: 'pointer'
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Поместите ключ сюда</p>
          ) : (
            <span>
              Поместите ключ сюда или нажмите{' '}
              <span
                style={{
                  textDecoration: 'underline'
                }}
              >
                Выбрать файл
              </span>
            </span>
          )}
        </div>
      ) : (
        <>
          <p>
            Публичный ключ: {selectedKey.pub[0]} {selectedKey.pub[1]}
          </p>
          <p>Приватный ключ: {selectedKey.priv}</p>
        </>
      )}
    </div>
  );
};

const SignGuarantee = ({ state, onSign, onClose }) => {
  const [key, setKey] = useState(null);

  return (
    <Modal open={state.opened}>
      <Modal.Header>Подпись гарантии</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Dropzone selectedKey={key} setKey={setKey} />
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" onClick={onClose}>
          Отмена
        </Button>
        <Button
          disabled={!key}
          primary
          onClick={() => {
            const nextStatus = state.guarantee.status <= 2 ? 3 : 8;

            try {
              const ec = new EC('secp256k1');
              const newKey = ec.keyFromPrivate(key.priv, 'hex');
              const msgHash = signMessage(state.guarantee, nextStatus);

              const hash = sha256.create();
              hash.update(msgHash);

              const signature = newKey.sign(hash.array());

              onSign({
                r: signature.r.toString('hex'),
                s: signature.s.toString('hex')
              });
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Подписать
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default SignGuarantee;
