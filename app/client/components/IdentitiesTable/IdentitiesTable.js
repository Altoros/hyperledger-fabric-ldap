import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Button, Table, Modal, Popup, Header, Select} from 'semantic-ui-react';

const BUTTONS = [
    {
        label: 'View details',
        type: 'identities',
        icon: 'eye'
    }
];

const valueOptions = [
    {key: '5', value: '5', text: '5'},
    {key: '10', value: '10', text: '10'},
    {key: '15', value: '15', text: '15'},
    {key: '20', value: '20', text: '20'},
    {key: '25', value: '25', text: '25'},
    {key: '30', value: '30', text: '30'},
];

import {COMMON_ACTIONS} from '../../constants'
import {post, get} from '../../utils/api';

const IdentitiesTable = ({identities, assets, userGroups, type}) => {
    const [sortBy, setSortBy] = useState({
        column: '',
        direction: 'descending'
    });

    const [req, setReq] = useState({
        loading: false,
        error: false
    });

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
                        <Table.Cell><Select placeholder='Select value'
                                            options={valueOptions}
                        /></Table.Cell>
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
                                                        loading={req.loading}
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
                                                                    args.x = "10";
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
                                    )}
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
