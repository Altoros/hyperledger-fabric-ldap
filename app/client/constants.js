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

export const INPUT_FIELDS = {
    IDENTITY: [
        'name',
        'mspid',
        'roles',
        'affiliation',
        'identifier',
        'certificate'
    ],
    CHANGE_PASSWORD: [
        {
            field: 'currentPassword',
            props: {
                type: 'password',
                label: 'Current password',
                placeholder: 'Type current password'
            }
        },
        {
            field: 'newPassword',
            props: {
                type: 'password',
                label: 'New password',
                placeholder: 'Type new password'
            }
        },
        {
            field: 'newPasswordRepeat',
            props: {
                type: 'password',
                label: 'Repeat new password',
                placeholder: 'Type new password again'
            }
        }
    ]
};

export const ATTRIBUTES = [
    {name: "cn"},
    {name: "gidNumber"},
    {name: "givenName"},
    {name: "homeDirectory"},
    {name: "loginShell"},
    {name: "mail"},
    {name: "o"},
    {name: "objectClass"},
    {name: "ou"},
    {name: "sn"},
    {name: "st"},
    {name: "uid"},
    {name: "uidNumber"},
    {name: "memberOf"}
];