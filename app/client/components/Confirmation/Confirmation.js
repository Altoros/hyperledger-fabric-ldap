import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Confirm, Button } from 'semantic-ui-react';

const Confirmation = ({
  isOpened,
  handleCancel,
  handleConfirm,
  header = '',
  text
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Confirm
      header={header}
      closeOnDimmerClick={false}
      content={text}
      open={isOpened}
      onCancel={handleCancel}
      onConfirm={async () => {
        setLoading(true);
        await handleConfirm();
        setLoading(false);
      }}
      confirmButton={<Button loading={loading}>Подтвердить</Button>}
      cancelButton={
        <Button disabled={loading} color="red">
          Отмена
        </Button>
      }
    />
  );
};

Confirmation.propTypes = {
  isOpened: PropTypes.bool,
  handleCancel: PropTypes.func,
  handleConfirm: PropTypes.func,
  text: PropTypes.string,
  header: PropTypes.string
};

export default Confirmation;
