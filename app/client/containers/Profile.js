import React, { useReducer, useState, useContext } from 'react';
import { Form, Button, Message, Grid, Menu, Segment } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';

import { ec as EC } from 'elliptic';

import { AuthContext } from '../context/auth';
import { form } from '../reducers/form';
import { INPUT_FIELDS } from '../constants';
import { post, get } from '../utils/api';

const initialState = INPUT_FIELDS.CHANGE_PASSWORD.reduce(
  (prev, curr) => {
    prev[curr.field] = '';
    prev.touched[curr.field] = false;
    return prev;
  },
  {
    touched: {}
  }
);

const Profile = ({ history }) => {
  const [formState, dispatch] = useReducer(form, initialState);
  const errors = {};
  const [req, setReq] = useState({
    loading: false,
    error: false
  });

  const [activeTab, setActiveTab] = useState('password');

  const { logout, user } = useContext(AuthContext);

  const generateKeyRole = user.user_info.roles.includes('Send');

  return (
    <>
      <Grid>
        <Grid.Column width={4}>
          <Menu fluid vertical tabular>
            <Menu.Item
              name="Сменить пароль"
              active={activeTab === 'password'}
              onClick={() => {
                setActiveTab('password');
              }}
            />
            {generateKeyRole ? (
              <Menu.Item
                name="Сгенерировать ключ"
                active={activeTab === 'keys'}
                onClick={() => {
                  setActiveTab('keys');
                }}
              />
            ) : (
              <></>
            )}
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={12}>
          {activeTab === 'password' ? (
            <Segment>
              {user.force_password_change ? (
                <Message color="red" content="Необходимо сменить пароль" />
              ) : (
                <></>
              )}
              <Form>
                {INPUT_FIELDS.CHANGE_PASSWORD.map((input, j) => (
                  <Form.Group widths={'equal'} key={j}>
                    <Form.Input
                      {...input.props}
                      error={errors[input.field]}
                      value={formState[input.field]}
                      onChange={(_, { value }) =>
                        dispatch({
                          type: 'CHANGE_TEXT_INPUT',
                          field: input.field,
                          value
                        })
                      }
                    />
                  </Form.Group>
                ))}

                {req.error ? (
                  <Message color="red">
                    <p>{req.error}</p>
                  </Message>
                ) : (
                  <></>
                )}

                <Button
                  loading={req.loading}
                  primary
                  onClick={async () => {
                    try {
                      setReq({ ...req, loading: true });
                      const res = await post('/api/changePassword', formState);
                      const data = await res.json();
                      if (!data.ok && data.error) {
                        throw new Error(data.error);
                      }
                      setReq({ ...req, loading: false });
                      setTimeout(async () => {
                        await logout();
                        history.push('/');
                      }, 250);
                    } catch (e) {
                      console.error(e);
                      setReq({ error: e.message, loading: false });
                    }
                  }}
                >
                  Сменить пароль
                </Button>
              </Form>
            </Segment>
          ) : (
            <></>
          )}
          {activeTab === 'keys' ? (
            <Segment>
              <div>
                <Button
                  primary
                  style={{ margin: 'auto' }}
                  onClick={async () => {
                    const ec = new EC('secp256k1');
                    // Generate keys
                    const key = ec.genKeyPair();
                    const newKey = {
                      pub: key.getPublic(),
                      priv: key.priv
                    };
                    try {
                      setReq({ ...req, loading: true });
                      await post('/api/changeUserPublicKey', {
                        publicKey: JSON.stringify(newKey.pub)
                      });
                      setReq({ ...req, loading: false });
                      const json = JSON.stringify(newKey);
                      const blob = new Blob([json], {
                        type: 'application/json'
                      });
                      const href = await URL.createObjectURL(blob);

                      const link = document.createElement('a');
                      link.setAttribute('href', href);
                      link.setAttribute('download', `key.json`);
                      document
                        .getElementById('_hidden_download_div_')
                        .appendChild(link);
                      link.click();
                    } catch (e) {
                      console.error(e);
                      setReq({ error: e.message, loading: false });
                    }
                  }}
                >
                  Cгенерировать пару ключей
                </Button>
                <Button
                  primary
                  style={{ marginLeft: 15 }}
                  onClick={async () => {
                    try {
                      setReq({ ...req, loading: true });
                      const res = await get('/api/getUserPublicKey');
                      const data = await res.json();
                      if (!data.ok && data.error) {
                        throw new Error(data.error);
                      }
                      setReq({ ...req, loading: false });

                      const json = JSON.stringify({ pub: data.publicKey });
                      const blob = new Blob([json], {
                        type: 'application/json'
                      });
                      const href = await URL.createObjectURL(blob);

                      const link = document.createElement('a');
                      link.setAttribute('href', href);
                      link.setAttribute('download', `public-key.json`);
                      document
                        .getElementById('_hidden_download_div_')
                        .appendChild(link);
                      link.click();
                    } catch (e) {
                      console.error(e);
                      setReq({ error: e.message, loading: false });
                    }
                  }}
                >
                  Скачать публичный ключ
                </Button>
              </div>
              {req.error ? (
                <Message color="red">
                  <p>{req.error}</p>
                </Message>
              ) : (
                <></>
              )}
            </Segment>
          ) : (
            <></>
          )}
        </Grid.Column>
      </Grid>
      <div id="_hidden_download_div_" style={{ display: 'none' }} />
    </>
  );
};

export default withRouter(props => <Profile {...props} />);
