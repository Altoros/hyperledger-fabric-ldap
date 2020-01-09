import React, { useState, useEffect, useContext } from 'react';
import { withRouter, Link, Redirect } from 'react-router-dom';
import {
  Button,
  Menu,
  Dropdown,
  Segment,
  Icon,
  Message
} from 'semantic-ui-react';

import { AuthContext } from '../context/auth';
import { useGet } from '../hooks';

import GuaranteesTable from '../components/GuaranteesTable/GuaranteesTable';

import { GUARANTEE_STATUS } from '../constants';

const getDefaultFilterByRole = roles => {
  if (roles.length === 1) {
    if (roles.includes('Send')) {
      return ['2', '3', '7', '8'];
    }
    if (roles.includes('Confirm')) {
      return ['1', '6'];
    }
  }

  return [];
};

const Guarantees = ({ match }) => {
  const type = match.path.slice(1);

  const tabs = {
    drafts: 'drafts',
    outgoing: 'listByIssuer',
    incoming: 'listByReceiver'
  };

  const { user } = useContext(AuthContext);

  if (user.force_password_change) {
    return <Redirect to="/profile" />;
  }

  const roles = user.user_info.roles;

  const activeTab = tabs[type];
  const [req, , fetch] = useGet(`/api/guarantees?type=${activeTab}`);
  const [filterBy, setFilterBy] = useState(getDefaultFilterByRole(roles));

  useEffect(() => {
    if (req.data || req.error) {
      fetch();
    }
  }, [activeTab]);

  if (req.loading) {
    return <>Загрузка...</>;
  }

  return (
    <>
      {roles.includes('Execute') ? (
        <Button primary as={Link} to="/drafts/add">
          Создать гарантию
        </Button>
      ) : (
        <></>
      )}
      <Segment>
        <Menu text>
          <Menu.Item
            name="Черновики"
            as={Link}
            to="/drafts"
            active={type === 'drafts'}
          />
          <Menu.Item
            content={<>Гарантии, выданные нами</>}
            active={type === 'outgoing'}
            as={Link}
            to="/outgoing"
          />
          <Menu.Item
            content={<>Гарантии, выданные нам</>}
            active={type === 'incoming'}
            as={Link}
            to="/incoming"
          />
        </Menu>
        {req.error ? (
          <Message color="red">{req.error}</Message>
        ) : (
          <>
            {!req.data || !req.data.length ? (
              <>Гарантии не найдены</>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  <Icon
                    style={{
                      margin: 5,
                      marginBottom: 'auto',
                      marginTop: 'auto'
                    }}
                    name="filter"
                  />
                  <p
                    style={{
                      margin: 5,
                      marginBottom: 'auto',
                      marginTop: 'auto'
                    }}
                  >
                    Статус
                  </p>
                  <Dropdown
                    value={filterBy}
                    placeholder="Все"
                    multiple
                    search
                    selection
                    onChange={(_, data) => {
                      setFilterBy(data.value);
                    }}
                    noResultsMessage=""
                    options={[].concat(
                      Object.keys(GUARANTEE_STATUS).map(status => ({
                        key: status,
                        text: GUARANTEE_STATUS[status],
                        value: status
                      }))
                    )}
                  />
                </div>
                <GuaranteesTable
                  type={type}
                  data={req.data}
                  filterBy={filterBy}
                  userRoles={roles}
                />
              </>
            )}
          </>
        )}
      </Segment>
    </>
  );
};

export default withRouter(props => <Guarantees {...props} />);
