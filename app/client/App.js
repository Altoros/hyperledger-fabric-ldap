import React, { useContext } from 'react';

import { Route, Switch, Redirect, Link } from 'react-router-dom';
import { Container, Breadcrumb } from 'semantic-ui-react';

import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

import Login from './Login';

import { AuthContext } from './context/auth';
import Ideintities from './containers/Identities';
import IdentityDetail from './containers/IdentityDetail';

import Header from './components/Header/Header';

import Profile from './containers/Profile';

import 'semantic-ui-css/semantic.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.css';

const App = ({ breadcrumbs }) => {
  const { isAuth, login, org } = useContext(AuthContext);
  const sections = breadcrumbs.map(({ match, breadcrumb }, idx) => {
    const lastBreadcrumb = breadcrumbs.length - 1 === idx;
    return {
      key: `breadcrumb-${idx}`,
      content: lastBreadcrumb ? (
        <>{breadcrumb}</>
      ) : (
        <Link to={match.url}>{breadcrumb}</Link>
      ),
      active: lastBreadcrumb
    };
  });

  if (!isAuth) {
    return <Login login={login} />;
  }

  return (
    <>
      <div className="no-print">
        <>
          <Header />
          <Container>
            <Breadcrumb divider="/" sections={sections} />
          </Container>
        </>
      </div>

      <Container
        style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <Container>
          <Switch>
            <Route exact path="/identities" component={Ideintities} />
            <Route exact path="/identities/:id" component={IdentityDetail} />
            <Route exact path="/profile" component={Profile} />
            <Redirect from="*" to="/identities" />
          </Switch>
        </Container>
      </Container>
    </>
  );
};

export default withBreadcrumbs([
  { path: '/', breadcrumb: 'Home' },
  { path: '/identities', breadcrumb: 'Identities' },
  { path: '/identities/:id', breadcrumb: 'Identity Detail' },
  { path: '/profile', breadcrumb: 'Profile' }
])(App);
