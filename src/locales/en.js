export default {
    date: {
        date: 'YYYY-MM-DD',
        dateTime: 'YYYY-MM-DD HH:mm:ss',
        dateTimeFull: '[on] MMM DD, YYYY [at] H:m A',
        time: 'HH:mm:ss',
        MDTime: 'MMM DD [at] HH:mm A',
        MD: 'MMM D',
        YM: 'MMM/YYYY',
        month: 'MMMM',
        smonth: 'MMM',
        w: 'w',
    },
    button: {
        add: 'Add {msg}',
        submit: 'Submit',
        cancel: 'Cancel',
        reset: 'Reset',
        new: 'New {msg}',
        edit: 'Edit {msg}',
        save: 'Save {msg}',
        delete: 'Delete {msg}',
        disabled: 'disabled {msg}',
    },
    h: {
        blank:                  '',
        level:                  'Level',
        used:                   'Used',
        activity:               'Activity',
        type:                   'Type',
        name:                   'Name',
        title:                  'Title',
        status:                 'Status',
        description:            'Description',
        urgency:                'Urgency',
        last:                   'Last',
        settings:               'Settings',
        color:                  'Color',
        baserole:               'Baserole',
        jobtitle:               'Job Title',
        role:                   'Role',
        email:                  'Email',
        customizecolumns:       'Customize Columns',
        notification:           'Notification',
        actionability:          'Actionability',
        open:                   'Open',
        triggered:              'Triggered',
        acknowledged:           'Acknowledged',
        acknowledge:            'Acknowledge',
        acknowledgement:        'Acknowledgement',
        resolved:               'Resolved',
        anystatus:              'Anystatus',
        assigndtome:            'Assignd To Me',
        auto:                   'Auto',
        resolution:             'Resolution',
        all:                    'All',
        reassign:               'Reassign',
        snooze:                 'Snooze',
        youropenincidents:      'Your Open Incidents',
        allopenincidents:       'All Open Incidents',
        created:                'Created',
        assignedto:             'Assigned To',
        hours:                  'Hours',
        others:                 'Others',
        severity:               'Severity',
        summary:                'Summary',
        source:                 'Source',
        action:                 'Action',
        actions:                'Actions',
        actionsperformed:       'Actions Performed',
        chinese:                'Chinese',
        english:                'English',
        language:               'Language',
        logout:                 'Logout',
        and:                    'And',
        add:                    'Add',
        save:                   'Save',
        new:                    'New',
        create:                 'Create',
        delete:                 'Delete',
        edit:                   'Edit',
        related:                'Related',
        details:                'Details',
        disabled:               'Disabled',
        enabled:                'Enabled',
        start:                  'Start',
        end:                    'End',
        time:                   'Time',
        timezone:               'Timezone',
        timeout:                'Time',
        timeouts:               'Times',
        home:                   'Home',
        merge:                  'Merge',
        resolve:                'Resolve',
        redact:                 'Redact',
        responder:              'Responder',
        response:               'Response',
        responders:             'Responders',
        subscribers:            'Subscribers',
        timeline:               'Timeline',
        configuration:          'Configuration',
        maintenances:           'Maintenances',
        maintenance:            'Maintenance',
        maintenancewindows:     'Maintenance Windows',
        escalation:             'Escalation',
        policies:               'Policies',
        policy:                 'Policy',
        users:                  'Users',
        user:                   'User',
        teams:                  'Teams',
        team:                   'Team',
        service:                'Service',
        services:               'Services',
        incident:               'Incident',
        incidents:              'Incidents',
        alert:                  'Alert',
        alerts:                 'Alerts',
        schedule:               'Schedule',
        schedules:              'Schedules',
        integration:            'Integration',
        integrations:           'Integrations',
        event:                  'Event',
        events:                 'Events',
        rule:                   'Rule',
        rules:                  'Rules',
        account:                'Account',
        api:                    'Api',
        key:                    'Key',
        access:                 'Access',
        extensions:             'Extensions',
        analytics:              'Analytics',
        reports:                'Reports',
        postmortems:            'Postmortems',
        command:                'Command',
        console:                'Console',
        createdon:              'Create On',
        movetoanotherincident:  'Move To Another Incident',
        findanexistingincident: 'Find An Existing Incident',
        findincident: 'Find Incident',
        relatedtoincident: 'Related To Incident',
        alerttimes: 'Alert Times',
        alertkey: 'Alert Key',
        currentstatus: 'Current Status',
        viewmessage: 'View Message',
        messageMEI: 'Move to an existing incident instead?',
        messageNI: 'Move to a new incident instead?',
        movealert: 'Move Alert',
        incidentkey: 'Incident Key',
        incidenttimes: 'Incident Times',
        servicedescription: 'Service Description',
        operate: 'Operate',
        view: 'View',


    },
    valid: {
        formError: 'Form valid error!',
        noSpecial: "This field can't contain '\\', '/', '&', '<', '>' or non-printable characters.",
        required: 'This field is required.',
        remote: 'Please fix this field.',
        email: 'Please enter a valid email address.',
        url: 'Please enter a valid URL.',
        date: 'Please enter a valid date.',
        dateISO: 'Please enter a valid date ( ISO .',
        number: 'Please enter a valid number.',
        digits: 'Please enter only digits.',
        creditcard: 'Please enter a valid credit card number.',
        equalTo: 'Please enter the same value again.',
        maxlength: 'Please enter no more than {0} characters.',
        minlength: 'Please enter at least {0} characters.',
        rangelength: 'Please enter a value between {0} and {1} characters long.',
        range: 'Please enter a value between {0} and {1}.',
        max: 'Please enter a value less than or equal to {0}.',
        min: 'Please enter a value greater than or equal to {0}.',
        targetRequired: 'Targets cannot be empty.',
        targetsMax: 'max. 50'
    },

    error: {
        ECONNABORTED: 'request timeout',
        HEDWID_COMMON: {
            SYSTEM_ERROR: 'system error, please contact administrator',
        },
        HEDWID_AUTH: {
            TOKEN_AUTHORIZATION_FAILED: 'authorization failed',
            TOKEN_EXPIRED: 'login timeout',
            USERPASSWORD_AUTHORIZATION_FAILED: 'wrong password'
        },
        HEDWID_UC: {
            NAME_IS_DUPLICATED: 'username is exist',
            ACCOUNT_NOT_FOUND: 'account not found',
            USER_NOT_FOUND: 'user not found',
            ACCOUNT_APITOKEN_NOT_FOUND: 'apiToken not found',
            ACCOUNT_INTEGRATION_NOT_FOUND: 'integration not found',
            USERPASSWORD_AUTHORIZATION_FAILED: 'password error',
        },
        HEDWID_ENGINE: {
            SERVICE_NOT_FOUND: 'service is not found',
            SERVICE_NAME_DUPLICATED: 'service name is duplicated',
            INTEGRATION_NOT_FOUND: 'integration is not found',
            INCIDENT_NOT_EXISTED: 'incident is not existed',
            INCIDENT_NOT_ASSIGN: 'incident is not assigned',
            INCIDENT_NOT_UPDATE_TRIGGERED: 'incident is not update triggered',
            INCIDENT_ALREADY_RESOLVED: 'incident already resolved',
            INCIDENT_RESOLVED_CANNOT_MERGE: 'resolved incident can\'t be merged',
            INCIDENT_UNACKNOWLEDGED_CANNOT_SNOOZE: 'unacknowledged incident can\'t be snoozed',
            INCIDENT_RESPONDER_MUST_JOIN_OR_DECLINE: 'incident responder must join or decline',
            INCIDENT_ASSIGNEE_NOT_ONCALL: 'incident assignee not oncall',
            ESCALATIONPOLICY_DEL_SERVICE_ERROR: 'delete escalation policy failed',
            SERVICE_IS_DISABLED: 'service is disabled',
            SERVICE_IN_MAINTENANCE: 'service in maintenance',
            EVENT_RULE_NOT_EXISTED: 'event rule is not existed',
            MAINTENANCE_WINDOW_NOT_EXISTTED: 'maintenance window is not existted',
            MAINTENANCE_WINDOW_CAN_NOT_UPDATE_ANYMORE: 'maintenance window can\'t be updated anymore',
        },
        HEDWID_SCHEDULE: {
            SCHEDULE_RECORD_NOT_FOUND: 'schedule record is not found',
            SCHEDULE_NAME_HAS_BEEN_TAKEN: 'schedule name is duplicate',
            SCHEDULE_LAYER_RECORD_NOT_FOUND: 'schedule layer record is not found',
            OVERRIDE_MUST_END_IN_THE_FUTURE: 'override end time can\'t before now',
            OVERRIDE_MUST_END_AFTER_ITS_START: 'override end time can\'t before start time',
            OVERRIDE_MUST_HAVE_A_USER: 'override must have a user',
            SCHEDULE_DATE_CHANGE_FAILED: 'schedule date is not valid',
            SCHEDULE_HAS_BINDING_ESCALATION_POLICY: 'schedule has binding escalation policy',
            SCHEDULE_DATA_EXCEPTION: 'schedule data is error',
            SCHEDULE_LAYER_RECORD_USER_NOT_FOUND: 'the user of schedule layer is not found',
        }
    }
}
