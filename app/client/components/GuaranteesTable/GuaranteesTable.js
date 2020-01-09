import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Table, Icon, Popup } from 'semantic-ui-react';

import { sort } from '../../utils';

import {
  GUARANTEE_STATUS,
  STATUS_TO_ICON,
  COMMON_ACTIONS,
  GUARANTEE_TYPE
} from '../../constants';

const BUTTONS = [
  {
    label: 'Просмотр',
    roles: ['Execute', 'Send', 'View', 'Confirm'],
    statuses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    icon: 'file alternate'
  },
  {
    label: 'Редактировать',
    roles: ['Execute'],
    statuses: [0],
    icon: 'edit'
  }
];

const filterByStatus = (data, statuses) =>
  data.filter(i => {
    if (statuses.length) {
      if (statuses.includes(i.status.toString())) {
        return true;
      }
      return false;
    }
    return true;
  });

const GuaranteesTable = ({ data, filterBy, userRoles, type }) => {
  const [sortBy, setSortBy] = useState({
    column: '',
    direction: 'descending'
  });

  const [sortedData, setSortedData] = useState(filterByStatus(data, filterBy));

  useEffect(() => {
    setSortedData(filterByStatus(data, filterBy));
  }, [filterBy]);

  useEffect(() => {
    setSortedData(sort(sortBy.column, sortBy.direction, sortedData));
  }, [sortBy]);

  return (
    <Table celled selectable sortable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell
            sorted={sortBy.column === 'id' ? sortBy.direction : null}
          >
            ID
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={sortBy.column === 'type' ? sortBy.direction : null}
          >
            Тип гарантии
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={sortBy.column === 'issuer' ? sortBy.direction : null}
            onClick={() =>
              setSortBy({
                ...sortBy,
                column: 'issuer',
                direction:
                  sortBy.direction === 'ascending' ? 'descending' : 'ascending'
              })
            }
          >
            Отправитель
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={sortBy.column === 'receiver' ? sortBy.direction : null}
            onClick={() =>
              setSortBy({
                ...sortBy,
                column: 'receiver',
                direction:
                  sortBy.direction === 'ascending' ? 'descending' : 'ascending'
              })
            }
          >
            Получатель
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={sortBy.column === 'status' ? sortBy.direction : null}
            onClick={() =>
              setSortBy({
                ...sortBy,
                column: 'status',
                direction:
                  sortBy.direction === 'ascending' ? 'descending' : 'ascending'
              })
            }
          >
            Статус
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={sortBy.column === 'date_of_issue' ? sortBy.direction : null}
            onClick={() =>
              setSortBy({
                ...sortBy,
                column: 'date_of_issue',
                direction:
                  sortBy.direction === 'ascending' ? 'descending' : 'ascending'
              })
            }
          >
            Дата выпуска
          </Table.HeaderCell>
          <Table.HeaderCell>Действия</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {sortedData &&
          sortedData.map(i => (
            <Table.Row key={i._id}>
              <Table.Cell>{i._id}</Table.Cell>
              <Table.Cell>{GUARANTEE_TYPE[i.type]}</Table.Cell>
              <Table.Cell>{i.issuer}</Table.Cell>
              <Table.Cell>{i.receiver.label}</Table.Cell>
              <Table.Cell
                positive={i.status === 2 || i.status === 7}
                warning={i.status === 1 || i.status === 6}
              >
                <Icon name={STATUS_TO_ICON[i.status][0]} />
                {STATUS_TO_ICON[i.status][1] ? (
                  <Icon name={STATUS_TO_ICON[i.status][1]} />
                ) : (
                  <></>
                )}
                {GUARANTEE_STATUS[i.status]}
              </Table.Cell>
              <Table.Cell>
                {new Date(i.date_of_issue).toLocaleDateString('ru')}
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
                    .filter(j => j.statuses.includes(i.status))
                    .filter(j => j.roles.some(k => userRoles.includes(k)))
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

GuaranteesTable.propTypes = {
  type: PropTypes.string,
  data: PropTypes.arrayOf(guaranteeShape),
  filterBy: PropTypes.arrayOf(PropTypes.string),
  userRoles: PropTypes.arrayOf(PropTypes.string)
};

export default GuaranteesTable;
