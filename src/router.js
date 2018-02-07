import Pages from './components/pages';

const routers = [
    {
        path: '/',
        redirect: '/incidents'
    },
    {
        path: '/Login',
        name: 'name',
        component: Pages.Login,
    }, {
        path: '/home',
        name: 'Home',
        component: Pages.Home,
        children: [
            {
                name: 'Incidents',
                path: '/incidents',
                component: Pages.Nothing,
                children: [
                    {
                        path: '',
                        component: Pages.Incidents,
                    },
                    {
                        path: ':id',
                        redirect: ':id/Details'
                    }, {
                        name: 'Incident Details',
                        path: ':id/:tab',
                        component: Pages.IncidentsDetail,
                    },
                ]
            }, {
                name: 'Alerts',
                path: '/alerts',
                component: Pages.Nothing,
                children: [
                    {
                        path: '',
                        component: Pages.Alerts,
                    }, {
                        name: 'Alert Details',
                        path: '/alerts/:alertId/details',
                        component: Pages.AlertsDetails,
                    },
                ]
            }, {
                name: 'Configuration',
                path: '/configuration',
                component: Pages.Nothing,
                children: [
                    {
                        name: 'Schedules',
                        path: '/schedules',
                        component: Pages.Nothing,
                        children: [
                            {
                                path: '',
                                component: Pages.Schedules,
                            },
                            {
                                name: 'Edit Schedule',
                                path: ':id/edit',
                                component: Pages.SchedulesEdit
                            }, {
                                name: 'Schedule Details',
                                path: ':id/view',
                                component: Pages.SchedulesEdit
                            }, {
                                name: 'Add Schedule',
                                path: 'new',
                                component: Pages.SchedulesEdit
                            },
                        ]
                    }, {
                        name: 'Escalation Policies',
                        path: '/policies',
                        component: Pages.Nothing,
                        children: [
                            {
                                path: '',
                                component: Pages.EscalationPolicies

                            }, {
                                name: 'Escalation Policy Details',
                                path: ':id/detail',
                                component: Pages.PolicyDetail

                            }, {
                                name: 'Add Escalation Policy',
                                path: 'add',
                                component: Pages.AddEscalationPolicy

                            }, {
                                name: 'Edit Escalation Policy',
                                path: ':id/edit',
                                component: Pages.EditEscalationPolicy

                            },
                        ]

                    }, {
                        name: 'Services',
                        path: '/services',
                        component: Pages.Nothing,
                        children: [
                            {
                                path: '',
                                component: Pages.Services,
                            },
                            {
                                path: ':id/detail',
                                redirect: ':id/detail/Incidents'
                            }, {
                                name: 'Service Details',
                                path: ':id/detail/:tab',
                                component: Pages.ServiceDetail,


                            }, {
                                name: 'Add Service',
                                path: 'add',
                                component: Pages.ServiceAdd
                            }, {
                                name: 'Edit Service',
                                path: ':id/edit',
                                component: Pages.ServiceAdd
                            }, {
                                name: 'Edit Event Rule',
                                path: '/services/:serviceId/eventrules/:id',
                                component: Pages.EventRulesEdit
                            }, {
                                name: 'Add Event Rule',
                                path: '/services/:serviceId/eventrules',
                                component: Pages.EventRulesEdit
                            }, {
                                name: 'Integration',
                                path: ':id/integration',
                                component: Pages.Nothing,
                                children: [
                                    {
                                        path: '',
                                        redirect: '/services/:id/detail/Integrations'
                                    },
                                    {
                                        name: 'Add Integration',
                                        path: 'add',
                                        component: Pages.IntegrationAdd
                                    }, {
                                        name: 'Integration Details',
                                        path: ':integrationId/detail',
                                        component: Pages.IntegrationDetail
                                    }, {
                                        name: 'Edit Integration',
                                        path: ':integrationId/edit',
                                        component: Pages.IntegrationEdit
                                    }

                                ]
                            }

                        ]
                    }, {
                        name: 'Maintenances',
                        path: '/maintenance',
                        component: Pages.Nothing,
                        children: [
                            {
                                path: '',
                                component: Pages.Services,
                            },
                            {
                                name: 'New Maintenance',
                                path: 'add',
                                component: Pages.MaintenanceEdit
                            }, {
                                name: 'Edit Maintenance',
                                path: ':id/edit',
                                component: Pages.MaintenanceEdit
                            }, {
                                name: 'Maintenance Details',
                                path: ':id/view',
                                component: Pages.MaintenanceEdit
                            }
                        ]
                    }, {
                        name: 'Users',
                        path: '/users',
                        component: Pages.Nothing,
                        children: [
                            {
                                path: '',
                                component: Pages.Users,
                            },
                            {
                                path: '/users/:id/detail',
                                redirect: '/users/:id'
                            },{
                                path: '/users/:id',
                                redirect: '/users/:id/ContactInformation'
                            },
                            {
                                name: 'User Details',
                                path: '/users/:id/:tab',
                                component: Pages.UserDetail
                            },
                        ]
                    },
                    {
                        name: 'Teams',
                        path: '/teams',
                        component: Pages.Nothing,
                        children: [
                            {
                                path: '',
                                component: Pages.Teams
                            },
                            {
                                name: 'Team Details',
                                path: '/teams/:id/detail',
                                component: Pages.TeamDetail
                            },
                        ]
                    }, {
                        name: 'API Access',
                        path: '/api_access',
                        component: Pages.APIAccess
                    },
                ]
            }, {
                name: 'Analytics',
                path: '/analytics',
                component: Pages.ComingSoon,
            }, {
                name: 'Command Console',
                path: '/command_console',
                component: Pages.ComingSoon,
            }, {
                name: 'Reports',
                path: '/reports',
                component: Pages.Reports,
            }, {
                name: 'Postmortems',
                path: '/postmortems',
                component: Pages.ComingSoon,
            }, {
                name: 'Account Settings',
                path: '/account_settings',
                component: Pages.ComingSoon,
            }, {
                name: 'Extensions',
                path: '/extensions',
                component: Pages.ComingSoon,
            }
        ]
    }, {
        path: '*', redirect: '/login'
    },
];
export default routers;
