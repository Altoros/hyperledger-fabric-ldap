import React, { useState, useCallback } from 'react';
import { Button, Modal, Message, Icon } from 'semantic-ui-react';

import { useDropzone } from 'react-dropzone';
import { ec as EC } from 'elliptic';
import sha256 from 'js-sha256';

const Dropzone = ({ selectedKey, setKey }) => {
  const onDrop = useCallback(acceptedFiles => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      setKey(JSON.parse(event.target.result));
    };
    fileReader.readAsText(acceptedFiles[0]);
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
            <p>Поместите публичный ключ сюда</p>
          ) : (
            <span>
              Поместите публичный ключ сюда или нажмите{' '}
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
        </>
      )}
    </div>
  );
};

const VerifyGuaranteeSignature = ({ state, onClose }) => {
  const [key, setKey] = useState(null);
  const [message, setMessage] = useState({
    hidden: true,
    success: false
  });

  return (
    <Modal open={state.opened}>
      <Modal.Header>Проверка подписи</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          {/* {state.guarantee ? (
            <p>Подпись: {state.guarantee.signature}</p>
          ) : (
            <></>
          )}
          {state.guarantee ? (
            <p>Данные для подписи: {state.guarantee.signed_body}</p>
          ) : (
            <></>
          )} */}
          <Dropzone selectedKey={key} setKey={setKey} />
          {message.hidden ? (
            <></>
          ) : (
            <Message icon color={message.success ? 'green' : 'red'}>
              <Icon name={message.success ? 'certificate' : 'cancel'} />
              <Message.Content>
                <Message.Header>
                  {message.success ? (
                    <>Подпись валидна </>
                  ) : (
                    <>Подпись невалидна</>
                  )}
                </Message.Header>
              </Message.Content>
            </Message>
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" onClick={onClose}>
          Закрыть
        </Button>
        <Button
          disabled={!key}
          primary
          onClick={() => {
            try {
              const guaranteeSignature = JSON.parse(state.guarantee.signature);
              const guaranteeBody = state.guarantee.signed_body;

              const ec = new EC('secp256k1');
              const pub = {
                x: key.pub[0].toString('hex'),
                y: key.pub[1].toString('hex')
              };

              const newKey = ec.keyFromPublic(pub, 'hex');

              const hash = sha256.create();
              hash.update(guaranteeBody);

              const virified = newKey.verify(hash.array(), guaranteeSignature);

              setMessage({
                success: virified
              });
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Проверить подпись
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default VerifyGuaranteeSignature;
