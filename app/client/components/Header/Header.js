import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { Button, Menu, Label, Popup } from 'semantic-ui-react';

import { AuthContext } from '../../context/auth';
import { ROLES } from '../../constants';

import logo from '../../logo.png';

const Header = ({ history }) => {
  const { isAuth, user, logout } = useContext(AuthContext);
  const roles = user.user_info.roles.map(i => ROLES[i]);

  if (!isAuth) {
    return <></>;
  }
  return (
    <Menu
      pointing
      style={{ borderRadius: 0, paddingLeft: '3%', paddingRight: '3%' }}
      borderless
    >
      <Menu.Menu>
        <Menu.Item as={Link} to={'/'}>
          <img src={logo} />
        </Menu.Item>
      </Menu.Menu>

      <Menu.Menu position="right">
        {!isAuth ? (
          <></>
        ) : (
          <>
            <Menu.Item>
              {roles.length ? <p>Роль: {roles.join(', ')}</p> : <></>}
            </Menu.Item>

            <Menu.Item as={Link} to="/profile">
              <>
                {user.user_info.full_name}
                {user.force_password_change ? (
                  <Popup
                    content="Необходимо сменить пароль"
                    trigger={
                      <div
                        style={{
                          marginLeft: '2px',
                          height: '100%'
                        }}
                      >
                        <Label empty circular color="red" size="tiny"></Label>
                      </div>
                    }
                  />
                ) : (
                  <></>
                )}
              </>
            </Menu.Item>
            <Menu.Item>
              <Button
                compact
                onClick={async () => {
                  await logout();
                  history.push('/');
                }}
              >
                Выйти
              </Button>
            </Menu.Item>
          </>
        )}
      </Menu.Menu>
    </Menu>
  );
};

Header.propTypes = {
  history: PropTypes.shape()
};

export default withRouter(props => <Header {...props} />);
