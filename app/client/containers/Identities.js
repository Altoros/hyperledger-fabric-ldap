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

import IdentitiesTable from '../components/IdentitiesTable/IdentitiesTable';


const Identities = ({ match }) => {
  const type = match.path.slice(1);

  const tabs = {
    identities: 'identities'
  };

  const { user } = useContext(AuthContext);

  if (user.force_password_change) {
    return <Redirect to="/profile" />;
  }

  const groups = user.user_info.groups;

  const activeTab = tabs[type];
  const [req, , fetch] = useGet(`/api/identities`);

  useEffect(() => {
    if (req.data || req.error) {
      fetch();
    }
  }, [activeTab]);

  if (req.loading) {
    return <>Loading...</>;
  }

  return (
    <>
      <Segment>
        <Menu text>
          <Menu.Item
            name="All Identities"
            as={Link}
            to="/identities"
            active={type === 'identities'}
          />
        </Menu>
        {req.error ? (
          <Message color="red">{req.error}</Message>
        ) : (
          <>
            {!req.data || !req.data.length ? (
              <>Identities not found</>
            ) : (
              <>
                <IdentitiesTable
                  type={type}
                  data={req.data}
                  userGroups={groups}
                />
              </>
            )}
          </>
        )}
      </Segment>
    </>
  );
};

export default withRouter(props => <Identities {...props} />);
