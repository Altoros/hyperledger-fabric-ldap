import React, {useReducer, useState, useContext} from 'react';
import {Form, Button, Message, Grid, Menu, Segment} from 'semantic-ui-react';
import {withRouter} from 'react-router-dom';

import {AuthContext} from '../context/auth';
import {form} from '../reducers/form';
import {INPUT_FIELDS} from '../constants';
import {post, get} from '../utils/api';
import {useGet} from "../hooks";

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

const Profile = ({history}) => {
    const [formState, dispatch] = useReducer(form, initialState);
    const errors = {};
    const [req, setReq] = useState({
        loading: false,
        error: false
    });

    const [identityDetail] = useGet(
        `/api/identity`
    );

    const [activeTab, setActiveTab] = useState('password');

    const {logout, user} = useContext(AuthContext);

    return (
        <>
            <Grid>
                <Grid.Column width={4}>
                    <Menu fluid vertical tabular>
                        <Menu.Item
                            name="Change Password"
                            active={activeTab === 'password'}
                            onClick={() => {
                                setActiveTab('password');
                            }}
                        />
                        <Menu.Item
                            name="Identity Info"
                            active={activeTab === 'identity'}
                            onClick={() => {
                                setActiveTab('identity');
                            }}
                        />
                    </Menu>
                </Grid.Column>

                <Grid.Column stretched width={12}>
                    {activeTab === 'password' ? (
                        <Segment>
                            {user.force_password_change ? (
                                <Message color="red" content="You must change password"/>
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
                                            onChange={(_, {value}) =>
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
                                            setReq({...req, loading: true});
                                            const res = await post('/api/changePassword', formState);
                                            const data = await res.json();
                                            if (!data.ok && data.error) {
                                                throw new Error(data.error);
                                            }
                                            setReq({...req, loading: false});
                                            setTimeout(async () => {
                                                await logout();
                                                history.push('/');
                                            }, 250);
                                        } catch (e) {
                                            console.error(e);
                                            setReq({error: e.message, loading: false});
                                        }
                                    }}
                                >
                                    Change password
                                </Button>
                            </Form>
                        </Segment>
                    ) : (
                        <></>
                    )}
                    {activeTab === 'identity' ? (
                        <Segment>
                            <div>
                                <Form>
                                    {INPUT_FIELDS.IDENTITY.map((input, j) => (
                                        <Form.Group widths={'equal'} key={j}>
                                            <Form.Input
                                                {...input.props}
                                                error={errors[input.field]}
                                                value={formState[input.field]}
                                                onChange={(_, {value}) =>
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
                                                setReq({...req, loading: true});
                                                const res = await post('/api/changePassword', formState);
                                                const data = await res.json();
                                                if (!data.ok && data.error) {
                                                    throw new Error(data.error);
                                                }
                                                setReq({...req, loading: false});
                                                setTimeout(async () => {
                                                    await logout();
                                                    history.push('/');
                                                }, 250);
                                            } catch (e) {
                                                console.error(e);
                                                setReq({error: e.message, loading: false});
                                            }
                                        }}
                                    >
                                        Reenroll
                                    </Button>
                                </Form>
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
            <div id="_hidden_download_div_" style={{display: 'none'}}/>
        </>
    );
};

export default withRouter(props => <Profile {...props} />);
