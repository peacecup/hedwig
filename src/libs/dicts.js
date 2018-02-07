export default {
    service_status: {
        'active': {
            icon: 'checkmark',
            type: 'success',
            color: '#19be6b',
        },
        'disabled': {
            icon: 'pause',
            color: 'darkred',
        },
        'inactive': {
            icon: 'pause',
            color: '#000000',
        },
        'maintenance': {
            icon: 'settings',
            color: '#000000',
        },
        'critical': {
            icon: 'alert-circled',
            type: 'error',
            color: '#a60000',
        },
        'warning': {
            icon: 'pause',
            type: 'warning',
            color: '#ff4500',
        },
    },
    incident_status: {
        'resolved': {
            color : '#00a600',
        },
        'resolve': {
            color : '#00a600',
        },
        'triggered': {
            color : '#a60000',
        },
        'trigger': {
            color : '#a60000',
        },
        'acknowledged': {
            color : '#ff4500',
        },
        'acknowledge': {
            color : '#ff4500',
        },
    }
}