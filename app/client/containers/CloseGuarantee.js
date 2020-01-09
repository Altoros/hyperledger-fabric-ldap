import React, { useState } from 'react';
import { Button, Modal, Form } from 'semantic-ui-react';

import DatePicker from 'react-datepicker';
import ru from 'date-fns/locale/ru';

const CloseGuarantee = ({ state, onDateSelect, onClose }) => {
  const [dateOfClosure, setDateOfClosure] = useState(new Date());

  return (
    <Modal open={state.opened} size="small">
      <Modal.Header>Закрытие гарантии</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              <label
                style={{
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  marginRight: 10
                }}
              >
                <b>Фактическая дата закрытия</b>
              </label>
              <Form.Field
                selected={dateOfClosure}
                control={DatePicker}
                locale={ru}
                onChange={value => setDateOfClosure(value)}
                value={dateOfClosure}
                dateFormat="d MMMM yyyy"
                minDate={
                  state.guarantee
                    ? new Date(state.guarantee.date_of_issue)
                    : null
                }
              />
            </div>
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" onClick={onClose}>
          Отмена
        </Button>
        <Button
          primary
          onClick={() => {
            onDateSelect(dateOfClosure);
          }}
        >
          Закрыть гарантию
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default CloseGuarantee;
