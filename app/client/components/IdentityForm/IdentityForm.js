/* eslint camelcase: 0 */

import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import {Form, Grid, Button, Modal, Icon, Header} from 'semantic-ui-react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import {post, get} from '../../utils/api';

import {AuthContext} from '../../context/auth';

const Row = ({label, children, readOnly}) => (
    <Grid.Row className={readOnly ? 'readOnly' : ''} columns={2}>
        <Grid.Column width={3} className={'field identity-form-row'}>
            <label>{label}</label>
        </Grid.Column>
        <Grid.Column width={13}>{children}</Grid.Column>
    </Grid.Row>
);

const IdentityForm = ({state, dispatch, errors}) => {

    const handleChange = (field, value) => {
        return dispatch({
            type: 'CHANGE_TEXT_INPUT',
            field,
            value
        });
    };

    const {logout, user} = useContext(AuthContext);

    const [req, setReq] = useState({
        loading: false,
        error: false
    });

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
                        onChange={(_, {value}) =>
                            handleChange('certificate', value)
                        }
                    />
                </Row>
                <Row>
                    <Modal trigger={
                        <Button
                            loading={req.loading}
                            primary
                            onClick={async () => {
                                try {
                                    setReq({...req, loading: true});
                                    const res = await post('/api/decodex509', {certificate: state.enrollment.identity.certificate});
                                    const data = await res.json();
                                    if (!data.ok && data.error) {
                                        throw new Error(data.error);
                                    }
                                    setReq({...req, loading: false});
                                } catch (e) {
                                    console.error(e);
                                    setReq({error: e.message, loading: false});
                                }
                            }}
                        >
                            Decode
                        </Button>
                    } closeIcon>
                        <Header icon='info' content='Decoded x509 Certificate'/>
                        <Modal.Content>
                            <JSONPretty id="json-pretty" data={state.decodedCertificate}
                            ></JSONPretty>
                        </Modal.Content>
                        <Modal.Actions>
                        </Modal.Actions>
                    </Modal>

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
