/* eslint camelcase: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Grid } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import ru from 'date-fns/locale/ru';

import {
ATTRIBUTES
} from '../../constants'

const Row = ({ label, children, readOnly }) => (
  <Grid.Row className={readOnly ? 'readOnly' : ''} columns={2}>
    <Grid.Column width={3} className={'field identity-form-row'}>
      <label>{label}</label>
    </Grid.Column>
    <Grid.Column width={13}>{children}</Grid.Column>
  </Grid.Row>
);

const IdentityForm = ({ state, dispatch, errors}) => {
  const draftType = state.status <= 4 ? 'issue' : 'closure';
  const editMode = false;

  const handleChange = (field, value) => {
    return dispatch({
      type: 'CHANGE_TEXT_INPUT',
      field,
      value
    });
  };

  const rowsPadding =  'readOnly';

  return (
    <Form>
      <Grid>
        <Row readOnly={true} label={'Name'}>
          <p>state.name]</p>
        </Row>
        <Row readOnly={true} label={'MSPID'}>
          <p>state.mspid]</p>
        </Row>
        <Row readOnly={true} label={'Roles'}>
          <p>state.roles]</p>
        </Row>
        <Row readOnly={true} label={'Affiliation'}>
          <p>state.affiliation]</p>
        </Row>
        <Row readOnly={true} label={'Identifier'}>
          <p>state.identifier]</p>
        </Row>
        <Row readOnly={true} label="x509 Certificate">
          <Form.TextArea
            style={{
              whiteSpace: 'pre-wrap'
            }}
            className='identity-form-focused'
            placeholder="x509 Certificate"
            error={errors.certificate}
            value={state.certificate}
            onChange={(_, { value }) =>
              handleChange('certificate', value)
            }
          />
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
    affiliation: PropTypes.string,
    identifier: PropTypes.string,
    certificate: PropTypes.string
  }),
  dispatch: PropTypes.func,
  errors: PropTypes.shape(),
  roles: PropTypes.arrayOf(PropTypes.string)
};

export default IdentityForm;
