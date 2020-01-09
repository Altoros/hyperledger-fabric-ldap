/* eslint camelcase: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Grid } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import ru from 'date-fns/locale/ru';

import {
  GUARANTEE_STATUS,
  CLOSURE_STATUS,
  GUARANTEE_TYPE
} from '../../constants';

import { useGet } from '../../hooks';

const Row = ({ label, children, readOnly }) => (
  <Grid.Row className={readOnly ? 'readOnly' : ''} columns={2}>
    <Grid.Column width={3} className={'field guarantee-form-row'}>
      <label>{label}</label>
    </Grid.Column>
    <Grid.Column width={13}>{children}</Grid.Column>
  </Grid.Row>
);

const GuaranteeForm = ({ add, state, dispatch, errors, roles }) => {
  const draftType = state.status <= 4 ? 'issue' : 'closure';
  const editMode = [0, 5].includes(state.status);
  const editDraftIssue = state.status === 0 && roles.includes('Execute');

  let receivers = {
    data: [],
    loading: false
  };
  if (add) {
    [receivers] = useGet(`/api/receivers`);
  } else {
    receivers = {
      data: [
        {
          id: state.receiver.id,
          label: state.receiver.label
        }
      ],
      loading: false
    };
  }

  const handleChange = (field, value) => {
    return dispatch({
      type: 'CHANGE_TEXT_INPUT',
      field,
      value
    });
  };

  const rowsPadding = editDraftIssue ? '' : 'readOnly';

  return (
    <Form>
      <Grid>
        <Row readOnly={!editDraftIssue} label={'Статус гарантии'}>
          <p>{GUARANTEE_STATUS[state.status]}</p>
        </Row>

        {state.sent_to_confirm_by ||
        state.confirmed_by ||
        state.confirmed_by ? (
          <Grid.Row className={rowsPadding} columns={2}>
            <Grid.Column width={3} className={'field'}>
              <label>Последние изменения</label>
            </Grid.Column>
            <Grid.Column width={13}>
              <>
                {state.sent_to_confirm_by ? (
                  <p>Отправлено на подтверждение: {state.sent_to_confirm_by}</p>
                ) : (
                  <></>
                )}
                {state.confirmed_by ? (
                  <p>Подтверждено: {state.confirmed_by}</p>
                ) : (
                  <></>
                )}
                {state.signed_by ? <p>Подписано: {state.signed_by}</p> : <></>}
                {state.last_updated ? (
                  <p>
                    Дата изменения:{' '}
                    {new Date(state.last_updated).toLocaleString()}
                  </p>
                ) : (
                  <></>
                )}
              </>
            </Grid.Column>
          </Grid.Row>
        ) : (
          <></>
        )}

        <Row readOnly={!editDraftIssue} label="Тип гарантии">
          {editDraftIssue ? (
            <Form.Field
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              placeholder="Выберите тип гарантии"
              control={Select}
              onChange={(_, { value }) => handleChange('type', value)}
              value={state.type}
              options={[
                {
                  key: 0,
                  text: 'Прямая гарантия',
                  value: 0
                },
                {
                  key: 1,
                  text: 'Контр-гарантия',
                  value: 1
                },
                {
                  key: 2,
                  text: 'Гарантия с контр-гарантией',
                  value: 2
                }
              ]}
            />
          ) : (
            <p>{GUARANTEE_TYPE[state.type]}</p>
          )}
        </Row>

        <Row readOnly={!editDraftIssue} label="Дата выпуска">
          {editDraftIssue ? (
            <Form.Field
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              control={DatePicker}
              locale={ru}
              selected={state.date_of_issue}
              onChange={value => handleChange('date_of_issue', value)}
              value={state.date_of_issue}
              dateFormat="d MMMM yyyy"
              style={{ width: 300 }}
            />
          ) : (
            <p>{new Date(state.date_of_issue).toLocaleDateString()}</p>
          )}
        </Row>

        <Grid.Row className={rowsPadding} columns={4}>
          <Grid.Column width={3} className={'field guarantee-form-row'}>
            <label>Плановая дата закрытия</label>
          </Grid.Column>
          <Grid.Column width={6} className="field guarantee-form-row">
            {editDraftIssue ? (
              <Form.Field
                className={!editDraftIssue ? '' : 'guarantee-form-focused'}
                control={DatePicker}
                locale={ru}
                selected={state.date_of_expiration}
                onChange={value => handleChange('date_of_expiration', value)}
                value={state.date_of_expiration}
                dateFormat="d MMMM yyyy"
                style={{ width: 300 }}
              />
            ) : (
              <p>{new Date(state.date_of_expiration).toLocaleDateString()}</p>
            )}
          </Grid.Column>
          {state.status === 9 ? (
            <>
              <Grid.Column
                width={3}
                className={'field guarantee-form-row'}
                style={{
                  marginTop: 'auto',
                  marginBottom: 'auto'
                }}
              >
                <label>Фактическая дата закрытия</label>
              </Grid.Column>
              <p>{new Date(state.date_of_closure).toLocaleDateString()}</p>
            </>
          ) : (
            <></>
          )}
        </Grid.Row>

        <Row readOnly={!editDraftIssue} label="Отправитель">
          <p>{state.issuer}</p>
        </Row>

        <Row readOnly={!editDraftIssue} label="Получатель">
          {editDraftIssue ? (
            <Form.Field
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              placeholder="Выберите получателя"
              control={Select}
              onChange={(_, { value }) => handleChange('receiver', value)}
              value={add ? state.receiver : state.receiver.id}
              error={errors.receiver}
              loading={receivers.loading}
              options={
                receivers.loading
                  ? []
                  : receivers.data.map(i => ({
                      key: `key-${i.id}`,
                      text: i.label,
                      value: i.id,
                      disabled: !editDraftIssue
                    }))
              }
            />
          ) : (
            <p>{add ? state.receiver : state.receiver.id}</p>
          )}
        </Row>

        <Row readOnly={!editDraftIssue} label="Бенефициар">
          {editDraftIssue ? (
            <Form.Input
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              placeholder="Введите бенефициара"
              error={errors.beneficiary}
              value={state.beneficiary}
              onChange={(_, { value }) => handleChange('beneficiary', value)}
            />
          ) : (
            <p>{state.beneficiary}</p>
          )}
        </Row>

        <Row readOnly={!editDraftIssue} label="Регулирование">
          {editDraftIssue ? (
            <Form.Input
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              placeholder="Введите правила регулирования"
              error={errors.applicable_rules}
              value={state.applicable_rules}
              onChange={(_, { value }) =>
                handleChange('applicable_rules', value)
              }
            />
          ) : (
            <p>{state.applicable_rules}</p>
          )}
        </Row>

        <Row readOnly={!editDraftIssue} label="Информация для получателя">
          {editDraftIssue ? (
            <Form.TextArea
              style={{
                whiteSpace: 'pre-wrap'
              }}
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              placeholder="Введите информацию для получателя"
              error={errors.sender_to_receiver_information}
              value={state.sender_to_receiver_information}
              onChange={(_, { value }) =>
                handleChange('sender_to_receiver_information', value)
              }
            />
          ) : (
            <p>{state.sender_to_receiver_information}</p>
          )}
        </Row>

        <Row
          readOnly={!editDraftIssue}
          label="Основной текст гарантии"
          textArea
        >
          {editDraftIssue ? (
            <Form.TextArea
              className={!editDraftIssue ? '' : 'guarantee-form-focused'}
              placeholder={
                state.type === 0
                  ? 'Введите текст гарантии'
                  : 'При выпуске контр-гарантии укажите здесь начало текста, предшествующее тексту гарантии'
              }
              error={errors.details_of_guarantee}
              value={state.details_of_guarantee}
              onChange={(_, { value }) =>
                handleChange('details_of_guarantee', value)
              }
            />
          ) : (
            <span className="guaranteeText">{state.details_of_guarantee}</span>
          )}
        </Row>

        {state.type !== 0 ? (
          <>
            <Row
              readOnly={!editDraftIssue}
              label="Дополнительный текст 1"
              textAre={true}
            >
              {editDraftIssue ? (
                <Form.TextArea
                  className={!editDraftIssue ? '' : 'guarantee-form-focused'}
                  placeholder="При выпуске контр-гарантии укажите здесь текст гарантии"
                  error={errors.details_of_guarantee_additional_1}
                  value={state.details_of_guarantee_additional_1}
                  onChange={(_, { value }) =>
                    handleChange('details_of_guarantee_additional_1', value)
                  }
                />
              ) : (
                <span className="guaranteeText">
                  {state.details_of_guarantee_additional_1}
                </span>
              )}
            </Row>

            <Row
              readOnly={!editDraftIssue}
              label="Дополнительный текст 2"
              textArea
            >
              {editDraftIssue ? (
                <Form.TextArea
                  className={!editDraftIssue ? '' : 'guarantee-form-focused'}
                  disabled={!editDraftIssue}
                  placeholder="При выпуске контр-гарантии укажите здесь окончание текста, следующее за  текстом гарантии"
                  error={errors.details_of_guarantee_additional_2}
                  value={state.details_of_guarantee_additional_2}
                  onChange={(_, { value }) =>
                    handleChange('details_of_guarantee_additional_2', value)
                  }
                />
              ) : (
                <span className="guaranteeText">
                  {state.details_of_guarantee_additional_2}
                </span>
              )}
            </Row>
          </>
        ) : (
          <></>
        )}

        {draftType === 'closure' ? (
          <>
            <Row readOnly={!editDraftIssue} label="Cтатус закрытия">
              {editMode ? (
                <Form.Field
                  className={!editMode ? '' : 'guarantee-form-focused'}
                  control={Select}
                  placeholder="Выберите статус закрытия"
                  onChange={(_, { value }) =>
                    handleChange('closure_status', value)
                  }
                  value={state.closure_status}
                  error={errors.closure_status}
                  options={Object.keys(CLOSURE_STATUS).map(i => ({
                    key: `key-${i}`,
                    text: CLOSURE_STATUS[i],
                    value: i
                  }))}
                />
              ) : (
                <p>{CLOSURE_STATUS[state.closure_status]}</p>
              )}
            </Row>

            <Row readOnly={!editDraftIssue} label="Комментарий">
              {editMode ? (
                <Form.TextArea
                  className={!editMode ? '' : 'guarantee-form-focused'}
                  placeholder="Введите комментарий"
                  error={errors.comment_to_closure}
                  value={state.comment_to_closure}
                  onChange={(_, { value }) =>
                    handleChange('comment_to_closure', value)
                  }
                />
              ) : (
                <span className="guaranteeText">
                  {state.comment_to_closure}
                </span>
              )}
            </Row>
          </>
        ) : (
          <></>
        )}
      </Grid>
    </Form>
  );
};

GuaranteeForm.propTypes = {
  add: PropTypes.bool,
  state: PropTypes.shape({
    type: PropTypes.number,
    status: PropTypes.number,
    receiver: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]),
    applicable_rules: PropTypes.string,
    sender_to_receiver_information: PropTypes.string,
    details_of_guarantee: PropTypes.string,
    details_of_guarantee_additional_1: PropTypes.string,
    details_of_guarantee_additional_2: PropTypes.string,
    issuer: PropTypes.string,
    beneficiary: PropTypes.beneficiary,
    date_of_closure: PropTypes.date,
    date_of_issue: PropTypes.date,
    date_of_expiration: PropTypes.date,
    comment_to_closure: PropTypes.string,
    closure_status: PropTypes.string,
    sent_to_confirm_by: PropTypes.string,
    confirmed_by: PropTypes.string,
    signed_by: PropTypes.string,
    last_updated: PropTypes.string
  }),
  dispatch: PropTypes.func,
  errors: PropTypes.shape(),
  roles: PropTypes.arrayOf(PropTypes.string)
};

export default GuaranteeForm;
