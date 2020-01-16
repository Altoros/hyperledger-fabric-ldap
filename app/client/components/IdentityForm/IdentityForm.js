/* eslint camelcase: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import { Form, Grid } from 'semantic-ui-react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

const Row = ({ label, children, readOnly }) => (
  <Grid.Row className={readOnly ? 'readOnly' : ''} columns={2}>
    <Grid.Column width={3} className={'field identity-form-row'}>
      <label>{label}</label>
    </Grid.Column>
    <Grid.Column width={13}>{children}</Grid.Column>
  </Grid.Row>
);

const IdentityForm = ({ state, dispatch, errors}) => {

  const handleChange = (field, value) => {
    return dispatch({
      type: 'CHANGE_TEXT_INPUT',
      field,
      value
    });
  };

  return (
    <Form>
      <Grid>
        <Row readOnly={true} label={'Name'}>
          <p>{state.name}</p>
        </Row>
        <Row readOnly={true} label={'MSPID'}>
          <p>{state.mspid}</p>
        </Row>
        <Row readOnly={true} label={'Roles'}>
          <p>{state.roles}</p>
        </Row>
        <Row readOnly={true} label={'Affiliation'}>
          <p>{state.affiliation}</p>
        </Row>
        <Row readOnly={true} label={'Identifier'}>
          <p>{state.enrollment.signingIdentity}</p>
        </Row>
        <Row readOnly={true} label="x509 Certificate">
          <Form.TextArea
            style={{
              whiteSpace: 'pre-wrap'
            }}
            className='identity-form-focused'
            placeholder="x509 Certificate"
            value={state.enrollment.identity.certificate}
            rows={20}
            onChange={(_, { value }) =>
              handleChange('certificate', value)
            }
          />
        </Row>
        <Row readOnly={true} label="Decoded x509 Certificate">
          <JSONPretty id="json-pretty" style={{"background-color": "#1c2833"}} data={state.decodedCertificate} mainStyle="color: #ffffff" valueStyle={"color: #f5b041"} keyStyle="color: #77eef5"></JSONPretty>
        </Row>
      </Grid>
    </Form>
  );
};

IdentityForm.propTypes = {
  state: PropTypes.shape({
    name: PropTypes.string,
    mspid: PropTypes.string,
    roles: PropTypes.string,
    enrollment: PropTypes.object,
    decodedCertificate: PropTypes.object
  }),
  dispatch: PropTypes.func,
};

export default IdentityForm;
