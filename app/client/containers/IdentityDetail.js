/* eslint camelcase: 0 */

import React, { useReducer, useContext, createRef } from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import { Message } from 'semantic-ui-react';

import { useGet } from '../hooks';

import { form } from '../reducers/form';


import IdentityForm from '../components/IdentityForm/IdentityForm';

import { AuthContext } from '../context/auth';

const IdentityDetail = ({ data }) => {
  const contextRef = createRef();

  const { user } = useContext(AuthContext);
  const groups = user.user_info.groups;

  const [formState, dispatch] = useReducer(form, data);

  return (
    <div ref={contextRef}>
      <>
        <div
          style={{
            marginTop: 20
          }}
        >
          <IdentityForm
            groups={groups}
            state={formState}
            dispatch={dispatch}
          />
        </div>
      </>
    </div>
  );
};

const IdentityDetailWrapper = ({ match }) => {
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();

  const { params } = match;
  const { id } = params;
  const [data] = useGet(`/api/identities/${id}`
  );

  if (data.loading) {
    return <>Loading</>;
  }

  if (!data.data) {
    return <>Identity not found</>;
  }

  if (data.error) {
    return <Message color="red">{data.error || 'Not found'}</Message>;
  }

  return <IdentityDetail data={data.data} />;
};

export default withRouter(props => <IdentityDetailWrapper {...props} />);
