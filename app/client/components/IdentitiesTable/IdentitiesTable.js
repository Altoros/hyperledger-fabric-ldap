import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Button, Table, Icon, Popup} from 'semantic-ui-react';

const BUTTONS = [
    {
        label: 'View',
        type: 'identities',
        icon: 'info'
    },
    {
        label: 'Reenroll',
        type: 'enroll',
        icon: 'file alternate outline'
    },
    {
        label: 'Revoke',
        type: 'revoke',
        icon: 'file outline'
    },
    {
        label: 'Send',
        type: 'invoke',
        icon: 'send'
    }
];

const IdentitiesTable = ({data, userGroups, type}) => {
    const [sortBy, setSortBy] = useState({
        column: '',
        direction: 'descending'
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
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {data &&
                data.map(i => (
                    <Table.Row key={i.name}>
                        <Table.Cell>{i.name}</Table.Cell>
                        <Table.Cell>{i.mspid}</Table.Cell>
                        <Table.Cell>{i.enrollment.signingIdentity}</Table.Cell>
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
                                {BUTTONS
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
                                                    as={Link}
                                                    to={
                                                        `/${type}/${i.enrollment.signingIdentity}`
                                                    }
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

const guaranteeShape = PropTypes.shape({
    _id: PropTypes.string
});

IdentitiesTable.propTypes = {
    type: PropTypes.string,
    data: PropTypes.arrayOf(guaranteeShape),
    userGroups: PropTypes.arrayOf(PropTypes.string)
};

export default IdentitiesTable;
