import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Button, Table, Icon, Popup} from 'semantic-ui-react';

const BUTTONS = [
    {
        label: 'View',
        icon: 'info'
    },
    {
        label: 'Reenroll',
        icon: 'sync'
    },
    {
        label: 'Revoke',
        icon: 'close icon'
    }
];

import {
    COMMON_ACTIONS
} from '../../constants';

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
                        sorted={sortBy.column === 'certificate' ? sortBy.direction : null}
                    >
                        Certificate
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
                        <Table.Cell>{i.enrollment.identity.certificate}</Table.Cell>
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
                                {BUTTONS.map((button, idx) => (
                                    <Popup
                                        key={idx}
                                        content={button.label}
                                        trigger={
                                            <Button
                                                as={Link}
                                                to={
                                                    i.status === 4 || i.status === 9
                                                        ? `/${type}/${i._id}?type=cc&issuer=${i.issuer}&receiver=${i.receiver.id}`
                                                        : `/${type}/${i._id}`
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
