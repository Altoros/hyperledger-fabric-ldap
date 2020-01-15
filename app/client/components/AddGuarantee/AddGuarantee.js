/* eslint camelcase: 0 */

import React, { useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Button, Message } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

import IdentityForm from '../IdentityForm/GuaranteeForm';

import { form } from '../../reducers/form';
import { post } from '../../utils/api';

import { validateForm } from '../../utils/validation';

const AddGuarantee = ({ issuer }) => {
  const guaranteeInitialState = {
    type: 0,
    issuer,
    receiver: '',
    beneficiary: '',
    status: 0,
    applicable_rules: '',
    details_of_guarantee: '',
    details_of_guarantee_additional_1: '',
    details_of_guarantee_additional_2: '',
    sender_to_receiver_information: '',
    date_of_issue: new Date(),
    date_of_expiration: new Date(),
    date_of_closure: new Date(),
    touched: {
      receiver: false,
      beneficiary: false,
      applicable_rules: false,
      details_of_guarantee: false
    }
  };

  const [toGuarantees, setToGuarantees] = useState(false);
  const [formState, dispatch] = useReducer(form, guaranteeInitialState);
  const err = validateForm(formState);

  const [actionStatus, setActionStatus] = useState({});

  return (
    <>
      {toGuarantees ? <Redirect to="/" /> : null}
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
      <IdentityForm
        add={true}
        state={formState}
        dispatch={dispatch}
        errors={err}
        roles={['Execute']}
      />
      <Button
        style={{
          marginTop: 15,
          marginBottom: 40
        }}
        disabled={
          !!Object.keys(formState.touched).find(
            i => formState.touched[i] === false
          ) || Object.keys(err).length !== 0
        }
        primary
        onClick={async () => {
          try {
            const [error, result] = await post(
              '/api/guarantee/issue-draft-entry',
              formState
            ).then(async res => [!res.ok, await res.json()]);

            if (error) {
              console.error('error', result.error);
              setActionStatus({ error: result.error });
              return;
            }
            setTimeout(() => setToGuarantees(true), 200);
          } catch (e) {
            console.error(e);
            setActionStatus({ error: e.message });
          }
        }}
      >
        Создать
      </Button>
    </>
  );
};

AddGuarantee.propTypes = {
  issuer: PropTypes.string
};

export default AddGuarantee;
