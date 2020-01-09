/* eslint camelcase: 0 */

import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

import { COMMON_ACTIONS } from '../constants';

import { updateGuarantee } from '../utils/api';

import SignGuarantee from './SignGuarantee';
import CloseGuarantee from './CloseGuarantee';
import VerifyGuaranteeSignature from './VerifyGuaranteeSignature';
import Confirmation from '../components/Confirmation/Confirmation';

import { AuthContext } from '../context/auth';

const Actions = ({
  data,
  setActionStatus,
  formState,
  errors,
  guaranteeType
}) => {
  const { user } = useContext(AuthContext);
  const roles = user.user_info.roles;

  const { closure_draft_issued } = data;

  const [toGuarantees, setToGuarantees] = useState(false);

  const guaranteeId = data._id;
  const draftType = data.status <= 4 ? 'issue' : 'closure';

  const confirmationInitialState = {
    opened: false,
    text: '',
    confirm: () => {},
    cancel: () => {}
  };

  const signGuaranteeInitialState = {
    opened: false,
    guarantee: null
  };

  const closeGuaranteeInitialState = {
    opened: false,
    guarantee: null
  };

  const verifyGuaranteeSignatureInitialState = {
    opened: false,
    guarantee: null
  };

  const [confirmationState, setConfirmationState] = useState(
    confirmationInitialState
  );

  const [signGuaranteeState, setSignGuaranteeState] = useState(
    signGuaranteeInitialState
  );

  const [closeGuaranteeState, setCloseGuaranteeState] = useState(
    closeGuaranteeInitialState
  );

  const [
    verifyGuaranteeSignatureState,
    setVerifyGuaranteeSignatureState
  ] = useState(verifyGuaranteeSignatureInitialState);

  const closeConfirmationModal = () =>
    setConfirmationState(confirmationInitialState);

  const update = async (
    action,
    closeGuaranteeDetail,
    payload = { _id: guaranteeId }
  ) => {
    try {
      const [error, success] = await updateGuarantee(action, payload);
      if (error) {
        setActionStatus({ error });
        return;
      }

      if (success) {
        if (closeGuaranteeDetail) {
          setTimeout(() => setToGuarantees(true), 200);
          return;
        }
        setActionStatus({ success: 'Сохранено успешно' });
        setTimeout(() => setActionStatus({}), 5000);
      }
    } catch (e) {
      console.error(e);
      setActionStatus({ error: e.message });
    }
  };

  const openConfirmation = (
    action,
    text,
    header,
    closeGuaranteeDetail,
    onCancel = () => {}
  ) => {
    setConfirmationState({
      opened: true,
      text,
      header,
      confirm: async () => {
        try {
          await action();
          closeConfirmationModal();
          if (closeGuaranteeDetail) {
            setTimeout(() => setToGuarantees(true), 500);
          }
        } catch (e) {
          console.error(e);
        }
      },
      cancel: () => {
        closeConfirmationModal();
        onCancel();
      }
    });
  };

  const openUpdateConfirmation = (action, { confirm, header }, payload) =>
    openConfirmation(() => update(action, true, payload), confirm, header);

  const handlers = {
    'issue-draft-send-to-confirm': (action, { confirm, header }) => () => {
      openUpdateConfirmation(action, { confirm, header, action });
    },
    'issue-draft-confirm': (action, { confirm, header }) => () => {
      openUpdateConfirmation(action, { confirm, header, action });
    },
    'verify-and-issue': (action, { confirm, header }) => () =>
      openUpdateConfirmation(action, { confirm, header, action }),
    sign: () => () => {
      setSignGuaranteeState({ opened: true, guarantee: formState });
    },
    'issued-guarantee-closure': (action, { confirm, header }) => () =>
      openUpdateConfirmation(action, { confirm, header }),
    'closure-draft-send-to-confirm': (action, { confirm, header }) => () =>
      openUpdateConfirmation(action, { confirm, header, action }),
    'closure-draft-confirm': (action, { confirm, header }) => () =>
      openUpdateConfirmation(action, { confirm, header }),
    'closure-draft-sign': () => () =>
      setSignGuaranteeState({ opened: true, guarantee: formState }),
    'verify-and-close': () => () =>
      setCloseGuaranteeState({ opened: true, guarantee: data }),
    'draft-rollback-to-editing': (action, { confirm, header }) => () => {
      openUpdateConfirmation(`${draftType}-${action}`, { confirm, header });
    },
    'draft-delete': (action, { confirm, header }) => () =>
      openUpdateConfirmation(`${draftType}-${action}`, { confirm, header })
  };

  const buttons = [
    {
      color: 'blue',
      label: 'Сохранить',
      roles: ['Execute'],
      statuses: [0, 5],
      validate: true,
      handler: () => {
        update(`${draftType}-draft-edit`, false, {
          ...formState
        });
      }
    }
  ]
    .concat(
      closure_draft_issued || guaranteeType === 'incoming'
        ? []
        : {
            color: 'blue',
            label: 'Создать черновик закрытия',
            roles: ['Execute'],
            statuses: [4],
            icon: 'firstdraft',
            type: 'issued-guarantee-closure',
            confirm: 'Вы уверены, что хотите создать черновик закрытия?',
            handler: () =>
              openConfirmation(
                () => update('issued-guarantee-closure', true),
                'Вы уверены, что хотите создать черновик закрытия?',
                'Создать черновик закрытия'
              )
          }
    )
    .concat(
      COMMON_ACTIONS.map(i => {
        return { ...i, handler: handlers[i.type](i.type, i) };
      }).filter(i => {
        // workaround for Confirm status and draft-rollback-to-editing button
        if (i.type === 'draft-rollback-to-editing') {
          if (roles.includes('Confirm') && ![1, 6].includes(data.status)) {
            return false;
          }
          return true;
        }
        return true;
      })
    )
    .concat([
      {
        color: 'blue',
        label: 'Печать',
        statuses: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        roles: ['Confirm', 'View', 'Execute', 'Send'],
        handler: () => {
          window.print();
        }
      },
      {
        color: 'blue',
        label: 'Проверить подпись',
        statuses: [4, 9],
        roles: ['Confirm', 'View', 'Execute', 'Send'],
        handler: () => {
          setVerifyGuaranteeSignatureState({ opened: true, guarantee: data });
        }
      },
      {
        color: 'blue',
        label: 'Скачать гарантию .txt',
        statuses: [4, 9],
        roles: ['Confirm', 'View', 'Execute', 'Send'],
        handler: async () => {
          const json = JSON.stringify(
            {
              id: data.id,
              type: data.type,
              issuer: data.issuer,
              receiver: data.receiver.id,
              beneficiary: data.beneficiary,
              applicable_rules: data.applicable_rules,
              date_of_issue: data.date_of_issue,
              date_of_expiration: data.date_of_expiration,
              date_of_closure: data.date_of_closure,
              details: data.details,
              message: data.sender_to_receiver_information,
              status: data.status,
              signature: data.signature,
              signed_body: data.signed_body
            },
            null,
            2
          );
          const blob = new Blob([json], {
            type: 'text/plain'
          });
          const href = await URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.setAttribute('href', href);
          link.setAttribute('download', `${data.id}.txt`);
          document.getElementById('_hidden_download_div_').appendChild(link);
          link.click();
        }
      },
      {
        color: 'blue',
        label: 'Закрыть',
        statuses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        roles: ['Confirm', 'View', 'Execute', 'Send'],
        handler: () => {
          if (roles.includes('Execute')) {
            if (formState.status === 0 || formState.status === 5) {
              openConfirmation(
                async () =>
                  update(`${draftType}-draft-edit`, false, {
                    ...formState
                  }),
                'Сохранить изменения перед закрытием?',
                'Сохранить изменения',
                Object.keys(errors).length === 0,
                () => {
                  setToGuarantees(true);
                }
              );
              return;
            }
          }

          setToGuarantees(true);
        }
      }
    ]);

  return (
    <>
      <CloseGuarantee
        state={closeGuaranteeState}
        onClose={() => setCloseGuaranteeState(closeGuaranteeInitialState)}
        onDateSelect={async dateOfClosure => {
          await update('verify-and-close', true, {
            ...formState,
            _id: guaranteeId,
            date_of_closure: new Date(dateOfClosure).getTime()
          });
          setCloseGuaranteeState(closeGuaranteeInitialState);
        }}
      />
      <SignGuarantee
        state={signGuaranteeState}
        onClose={() => setSignGuaranteeState(signGuaranteeInitialState)}
        onSign={async signature =>
          update(`${draftType}-draft-sign`, true, {
            ...formState,
            signature
          })
        }
      />
      <VerifyGuaranteeSignature
        state={verifyGuaranteeSignatureState}
        onClose={() =>
          setVerifyGuaranteeSignatureState(verifyGuaranteeSignatureInitialState)
        }
      />
      <Confirmation
        header={confirmationState.header}
        isOpened={confirmationState.opened}
        handleConfirm={confirmationState.confirm}
        handleCancel={confirmationState.cancel}
        text={confirmationState.text}
      />
      {toGuarantees ? <Redirect to={`/${guaranteeType}`} /> : null}
      <>
        <div
          className="no-print"
          style={{
            backgroundColor: 'white',
            marginBottom: 20
          }}
        >
          {buttons
            .filter(i => i.statuses.includes(data.status))
            .filter(i => i.roles.some(j => roles.includes(j)))
            .map((button, idx) => (
              <Button
                key={idx}
                color={button.color}
                onClick={button.handler}
                disabled={
                  button.validate ? !!Object.keys(errors).length : false
                }
              >
                {button.label}
              </Button>
            ))}
        </div>
      </>
      <div id="_hidden_download_div_" style={{ display: 'none' }} />
    </>
  );
};

export default Actions;
