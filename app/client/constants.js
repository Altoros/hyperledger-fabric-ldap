export const GUARANTEE_STATUS = {
  0: 'Черновик',
  1: 'Ожидает подтверждения',
  2: 'Подтверждено',
  3: 'Подписана',
  4: 'Выпущена',
  5: 'Черновик закрытия',
  6: 'Закрыта к подтверждению',
  7: 'Закрыта к подписанию',
  8: 'Подписана к отправке',
  9: 'Закрыта'
};

export const GUARANTEE_TYPE = {
  0: 'Прямая гарантия',
  1: 'Контр-гарантия',
  2: 'Гарантия с контр-гарантией'
};

export const CLOSURE_STATUS = {
  '0': 'Без предъявления требования',
  '1': 'Осуществлена оплата',
  '2': 'Отказано в оплате'
};

export const INPUT_FIELDS = {
  GUARANTEE: [
    '_id',
    'type',
    'issuer',
    'receiver',
    'beneficiary',
    'status',
    'applicable_rules',
    'details_of_guarantee',
    'details_of_guarantee_additional_1',
    'details_of_guarantee_additional_2',
    'sender_to_receiver_information',
    'date_of_issue',
    'date_of_expiration',
    'date_of_closure',
    'comment_to_closure',
    'closure_status',
    'sent_to_confirm_by',
    'confirmed_by',
    'signed_by',
    'last_updated'
  ],
  CHANGE_PASSWORD: [
    {
      field: 'currentPassword',
      props: {
        type: 'password',
        label: 'Текущий пароль',
        placeholder: 'Введите текущий пароль'
      }
    },
    {
      field: 'newPassword',
      props: {
        type: 'password',
        label: 'Новый пароль',
        placeholder: 'Ввведите новый пароль'
      }
    },
    {
      field: 'newPasswordRepeat',
      props: {
        type: 'password',
        label: 'Повторите новый пароль',
        placeholder: 'Ввведите новый пароль еще раз'
      }
    }
  ]
};

export const ROLES = {
  Confirm: 'Подтверждение',
  View: 'Просмотр',
  Execute: 'Исполнитель',
  Send: 'Отправка'
};

export const STATUS_TO_ICON = {
  0: ['firstdraft'],
  1: ['firstdraft', 'wait'],
  2: ['firstdraft', 'checkmark'],
  3: ['firstdraft', 'signup'],
  4: ['chain', 'paper plane outline'],
  5: ['firstdraft'],
  6: ['firstdraft', 'wait'],
  7: ['firstdraft', 'checkmark'],
  8: ['firstdraft', 'signup'],
  9: ['chain', 'lock']
};

export const COMMON_ACTIONS = [
  {
    color: 'blue',
    type: 'issue-draft-send-to-confirm',
    label: 'Отправить на подтверждение',
    roles: ['Execute'],
    statuses: [0],
    icon: 'external alternate',
    header: 'Отправить на подтверждение',
    confirm: 'Вы уверены, что хотите отправить гарантию на подтверждение?',
    validate: true
  },
  {
    color: 'blue',
    label: 'Подтвердить',
    roles: ['Confirm'],
    statuses: [1],
    icon: 'thumbs up',
    type: 'issue-draft-confirm',
    header: 'Подтвердить гарантию',
    confirm: 'Вы уверены, что хотите подтвердить гарантию?'
  },
  {
    color: 'blue',
    label: 'Отправить',
    roles: ['Send'],
    statuses: [3],
    icon: 'send',
    type: 'verify-and-issue',
    header: 'Отправить гарантию',
    confirm: 'Вы уверены, что хотите отправить гарантию?'
  },
  {
    color: 'blue',
    label: 'Подписать',
    statuses: [2],
    roles: ['Send'],
    icon: 'key',
    type: 'sign'
  },
  {
    color: 'blue',
    label: 'Закрыть к подтверждению',
    roles: ['Execute'],
    statuses: [5],
    icon: 'write square',
    type: 'closure-draft-send-to-confirm',
    header: 'Закрыть к подтверждению',
    confirm: 'Вы уверены, что хотите закрыть гарантию к подтверждению?'
  },
  {
    color: 'blue',
    label: 'Подтвердить к подписанию',
    roles: ['Confirm'],
    statuses: [6],
    icon: 'thumbs up',
    type: 'closure-draft-confirm',
    header: 'Закрыть к подписанию',
    confirm: 'Вы уверены, что хотите закрыть гарантию к подписанию?'
  },
  {
    color: 'blue',
    label: 'Подписать к отправке',
    roles: ['Send'],
    statuses: [7],
    icon: 'key',
    type: 'closure-draft-sign',
    header: 'Закрыть к отправке',
    confirm: 'Вы уверены, что хотите закрыть гарантию к отправке?'
  },
  {
    color: 'blue',
    label: 'Закрыть Гарантию',
    roles: ['Send'],
    statuses: [8],
    icon: 'lock',
    type: 'verify-and-close',
    header: 'Закрыть гарантию',
    confirm: 'Вы уверены, что хотите закрыть гарантию?'
  },
  {
    color: 'yellow',
    label: 'Вернуть на редактирование',
    roles: ['Send', 'Execute', 'Confirm'],
    statuses: [1, 2, 3, 6, 7, 8],
    icon: 'undo',
    type: 'draft-rollback-to-editing',
    header: 'Вернуть на редактирование',
    confirm: 'Вы уверены, что хотите вернуть гарантию на редактирование?'
  },
  {
    color: 'red',
    label: 'Удалить',
    statuses: [0, 5],
    roles: ['Execute'],
    type: 'draft-delete',
    header: 'Удалить черновик',
    confirm: 'Вы уверены, что хотите удалить черновик гарантии?',
    icon: 'trash'
  }
];
