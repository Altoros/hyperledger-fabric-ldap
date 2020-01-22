import React, {useReducer, useState, useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Button, Table, Modal, Popup, Header, Form, Message} from 'semantic-ui-react';
import {COMMON_ACTIONS, INPUT_FIELDS} from '../../constants'
import {post, get} from '../../utils/api';
import {form} from '../../reducers/form';
import {AuthContext} from "../../context/auth";

const BUTTONS = [
    {
        label: 'View details',
        type: 'identities',
        icon: 'eye'
    }
];

const initialState = INPUT_FIELDS.MOVE.reduce(
    (prev, curr) => {
        prev[curr.field] = '';
        prev.touched[curr.field] = false;
        return prev;
    },
    {
        touched: {}
    }
);

const IdentitiesTable = ({identities, assets, userGroups, type}) => {
    const [formState, dispatch] = useReducer(form, initialState);
    const [sortBy, setSortBy] = useState({
        column: '',
        direction: 'descending'
    });
    const errors = {};
    const [req, setReq] = useState({
        loading: false,
        error: false
    });

    const {user} = useContext(AuthContext);

    return (
        <Table celled selectable sortable>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell
                        sorted={sortBy.column === 'name' ? sortBy.direction : null}
                    >
                        Name
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={sortBy.column === 'mspid' ? sortBy.direction : null}
                    >
                        MSPID
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={sortBy.column === 'assets' ? sortBy.direction : null}
                    >
                        Assets
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={sortBy.column === 'identity' ? sortBy.direction : null}
                    >
                        Identity
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={sortBy.column === 'value' ? sortBy.direction : null}
                    >
                        Value
                    </Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {identities &&
                identities.map(i => (
                    <Table.Row key={i.name}>
                        <Table.Cell>{i.name}</Table.Cell>
                        <Table.Cell>{i.mspid}</Table.Cell>
                        <Table.Cell>{
                            assets && assets
                                .filter(j => {
                                    return j.key.includes(i.name) && j.key.includes(i.mspid)
                                })
                                .map(j => j.value)
                        }</Table.Cell>
                        <Table.Cell>{i.enrollment.signingIdentity}</Table.Cell>
                        <Table.Cell>
                            <Form>
                                {INPUT_FIELDS.MOVE.map((input, j) => (
                                    <Form.Group widths={'equal'} key={j}>
                                        <Form.Input
                                            {...input.props}
                                            className="xInput"
                                            error={errors[input.field]}
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
                            </Form>
                        </Table.Cell>
                        <Table.Cell
                            style={{
                                width: 150
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row'
                                }}
                            >
                                {BUTTONS.concat(COMMON_ACTIONS)
                                    .map((button, idx) => (
                                            <Popup
                                                key={idx}
                                                content={button.label}
                                                trigger={
                                                    <Button
                                                        key={idx}
                                                        as={Link}
                                                        to={
                                                            button.type === 'identities'
                                                                ? `/${type}/${i.enrollment.signingIdentity}`
                                                                : `/${type}`
                                                        }
                                                        onClick={async () => {
                                                            let args = [];
                                                            switch (button.type) {
                                                                case 'move': {
                                                                    args.x = formState.value;
                                                                    args.id = i.mspid;
                                                                    args.cn = i.name;
                                                                    break
                                                                }
                                                                case 'revoke': {
                                                                    args.enrollmentId = i.name;
                                                                    break
                                                                }
                                                                default:
                                                                    break
                                                            }
                                                            try {
                                                                setReq({...req, loading: true});
                                                                const res = await post(`/api/${button.type}`, {...args});
                                                                const data = await res.json();
                                                                if (!data.ok && data.error) {
                                                                    throw new Error(data.error);
                                                                }
                                                                setReq({...req, loading: false});
                                                                setTimeout(async () => {
                                                                    window.location.reload();
                                                                }, 250);
                                                            } catch (e) {
                                                                console.error(e);
                                                                setReq({error: e.message, loading: false});
                                                            }

                                                        }}
                                                        icon={button.icon}
                                                    />
                                                }
                                            />
                                        )
                                    )
                                }
                            </div>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
};

IdentitiesTable.propTypes = {
    type: PropTypes.string,
    identities: PropTypes.arrayOf(PropTypes.object),
    assets: PropTypes.arrayOf(PropTypes.object),
    userGroups: PropTypes.arrayOf(PropTypes.string)
};

export default IdentitiesTable;
