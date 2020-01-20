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
    ]
};
