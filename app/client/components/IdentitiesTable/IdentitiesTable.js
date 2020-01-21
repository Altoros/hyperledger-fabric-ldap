import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Button, Table, Icon, Popup} from 'semantic-ui-react';

const BUTTONS = [
    {
        label: 'View details',
        type: 'identities',
        icon: 'eye'
    }
];

import {COMMON_ACTIONS} from '../../constants'
import { post, get } from '../../utils/api';

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
                        sorted={sortBy.column === 'identifier' ? sortBy.direction : null}
                    >
                        Identifier
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={sortBy.column === 'assets' ? sortBy.direction : null}
                    >
                        Assets
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
                        <Table.Cell>{i.enrollment.signingIdentity}</Table.Cell>
                        <Table.Cell>{
                            assets && assets
                                .filter(j => {
                                    return j.key.includes(i.name) && j.key.includes(i.mspid)
                                })
                                .map(j => j.value)
                        }</Table.Cell>
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
                                    .filter(j => {
                                        // workaround for Confirm status and draft-rollback-to-editing button
                                        if (j.type === 'draft-rollback-to-editing') {
                                            if (userRoles.includes('Confirm') && ![1, 6].includes(j.status)) {
                                                return false;
                                            }
                                            return true;
                                        }
                                        return true;
                                    })
                                    .map((button, idx) => (
                                        <Popup
                                            key={idx}
                                            content={button.label}
                                            trigger={
                                                <Button
                                                    loading={req.loading}
                                                    as={Link}
                                                    to={
                                                        button.type === 'identities'
                                                            ? `/${type}/${i.enrollment.signingIdentity}`
                                                            : `/${type}`
                                                    }
                                                    onClick={async () => {
                                                        if (button.type === 'set') {
                                                            try {
                                                                setReq({...req, loading: true});
                                                                const res = await post(`/api/${button.type}`, []);
                                                                const data = await res.json();
                                                                if (!data.ok && data.error) {
                                                                    throw new Error(data.error);
                                                                }
                                                                setReq({...req, loading: false});
                                                            } catch (e) {
                                                                console.error(e);
                                                                setReq({error: e.message, loading: false});
                                                            }
                                                        }

                                                    }}
                                                    icon={button.icon}
                                                />
                                            }
                                        />
                                    ))}
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
