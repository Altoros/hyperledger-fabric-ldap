export const INPUT_FIELDS = {
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
    ],
    MOVE: [
        {
            field: 'value',
            props: {
                type: 'text',
                placeholder: 'Type value'
            }
        }
    ]
};

export const COMMON_ACTIONS = [
    {
        label: 'Reenroll certificate',
        type: 'reenroll',
        icon: 'sync'
    },
    {
        label: 'Revoke certificate',
        type: 'revoke',
        icon: 'undo'
    },
    {
        label: 'Move assets',
        type: 'move',
        icon: 'credit card'
    },
    {
        label: 'Set assets',
        type: 'set',
        icon: 'plus'
    }
];
