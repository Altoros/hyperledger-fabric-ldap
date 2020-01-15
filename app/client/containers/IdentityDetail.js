/* eslint camelcase: 0 */

import React, { useState, useReducer, useContext, createRef } from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import { Message, Sticky } from 'semantic-ui-react';

import { useGet } from '../hooks';

import { INPUT_FIELDS } from '../constants';
import { form } from '../reducers/form';

import { validateForm } from '../utils/validation';

import IdentityForm from '../components/IdentityForm/IdentityForm';
import Actions from './Actions';

import { AuthContext } from '../context/auth';

const init = state => {
  return INPUT_FIELDS.IDENTITY.reduce(
    (prev, curr) => {
      prev[curr] = state[curr];
      if (dates.includes(curr)) {
        if (!state[curr]) {
          prev[curr] = new Date();
        } else {
          prev[curr] = new Date(state[curr]);
        }
      } else {
        prev[curr] = state[curr];
      }
      return prev;
    },
    { touched: {} }
  );
};

const IdentityDetail = ({ data, guaranteeType }) => {
  const contextRef = createRef();

  const { user } = useContext(AuthContext);
  const roles = user.user_info.roles;

  const [formState, dispatch] = useReducer(form, init(data));
  const validationErrors = validateForm(formState);

  const [actionStatus, setActionStatus] = useState({});

  return (
    <div ref={contextRef}>
      <>
        <Sticky context={contextRef}>
          <div
            className="no-print"
            style={{
              backgroundColor: 'white',
              marginBottom: 20
            }}
          >
            <Actions
              data={data}
              actionStatus={actionStatus}
              setActionStatus={setActionStatus}
              formState={formState}
              errors={validationErrors}
              guaranteeType={guaranteeType}
            />
          </div>
        </Sticky>
        <div
          style={{
            marginTop: 20
          }}
        >
          <div
            style={{
              marginBottom: 25
            }}
          >
            {actionStatus.error ? (
              <Message color="red">{actionStatus.error}</Message>
            ) : (
              <></>
            )}
            {actionStatus.success ? (
              <Message color="green">{actionStatus.success}</Message>
            ) : (
              <></>
            )}
          </div>
          <IdentityForm
            roles={roles}
            state={formState}
            dispatch={dispatch}
            errors={validationErrors}
          />
        </div>
      </>
    </div>
  );
};

const GuaranteeDetailWrapper = ({ match }) => {
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const guaranteeType = match.path.slice(1).replace('/:id', '');

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

  return <IdentityDetail data={data.data} guaranteeType={guaranteeType} />;
};

export default withRouter(props => <GuaranteeDetailWrapper {...props} />);
