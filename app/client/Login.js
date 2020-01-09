import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Message, Input } from 'semantic-ui-react';

function Login({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [req, setReq] = useState({
    loading: false,
    error: false
  });

  const inputRef = useRef(null);

  useEffect(() => inputRef.current.focus(), []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          marginTop: 15,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 300,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <Form>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Имя пользователя</label>
              <Input
                ref={inputRef}
                onChange={(_, { value }) => {
                  setUsername(value);
                }}
                value={username}
                placeholder="Имя пользователя"
                fluid
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label="Пароль"
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(_, { value }) => {
                setPassword(value);
              }}
            />
          </Form.Group>
          {req.error ? (
            <Message color="red">
              <p>{req.error.message}</p>
            </Message>
          ) : (
            <></>
          )}
          <Button
            type="submit"
            fluid
            primary
            loading={req.loading}
            onClick={async () => {
              try {
                setReq({
                  ...req,
                  loading: true
                });
                await login({ username, password });
              } catch (e) {
                console.error(e);
                setReq({
                  error: e,
                  loading: false
                });
              }
            }}
          >
            Войти
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Login;
