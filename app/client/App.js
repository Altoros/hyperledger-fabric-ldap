import React, { useContext } from 'react';

import { Route, Switch, Redirect, Link } from 'react-router-dom';
import { Container, Breadcrumb } from 'semantic-ui-react';

import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

import Login from './Login';

import { AuthContext } from './context/auth';
import Guarantees from './containers/Guarantees';
import GuaranteeDetail from './containers/GuaranteeDetail';

import Header from './components/Header/Header';

import AddGuarantee from './components/AddGuarantee/AddGuarantee';
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
            <Route
              exact
              path="/drafts/add"
              component={() => <AddGuarantee issuer={org} />}
            />
            <Route exact path="/drafts" component={Guarantees} />
            <Route exact path="/outgoing" component={Guarantees} />
            <Route exact path="/incoming" component={Guarantees} />
            <Route exact path="/drafts/:id" component={GuaranteeDetail} />
            <Route exact path="/outgoing/:id" component={GuaranteeDetail} />
            <Route exact path="/incoming/:id" component={GuaranteeDetail} />
            <Route exact path="/profile" component={Profile} />
            <Redirect from="*" to="/drafts" />
          </Switch>
        </Container>
      </Container>
    </>
  );
};

export default withBreadcrumbs([
  { path: '/', breadcrumb: 'Главная' },
  { path: '/drafts/add', breadcrumb: 'Создать гарантию' },
  { path: '/drafts', breadcrumb: 'Черновики' },
  { path: '/outgoing', breadcrumb: 'Гарантии, выданные нами' },
  { path: '/incoming', breadcrumb: 'Гарантии, выданные нам' },
  { path: '/drafts/:id', breadcrumb: 'Просмотр гарантии' },
  { path: '/outgoing/:id', breadcrumb: 'Просмотр гарантии' },
  { path: '/incoming/:id', breadcrumb: 'Просмотр гарантии' },
  { path: '/profile', breadcrumb: 'Профиль' }
])(App);
