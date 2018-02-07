/**
 * Created by binwang on 17/8/16.
 */
const menus = [{
    'id': 1,
    'title': 'Incidents',
    'icon': 'desktop',
    'path': '/incidents',
    'role': '1',
}, {
    'id': 4,
    'title': 'Alerts',
    'icon': 'user',
    'path': '/alerts',
    'role': '2',
}, {
    'id': 8,
    'title': 'Configuration',
    'icon': 'setting',
    'group': 'soft',
    'role': '3',
    'children': [
        {'id': 9, 'title': 'Schedules', 'path': '/schedules'}, 
        {'id': 10, 'title': 'Services', 'path': '/services'}, 
        {'id': 11, 'title': 'Escalation Policies', 'path': '/policies'}, 
        {'id': 12, 'title': 'Users', 'path': '/users'}, 
        {'id': 13, 'title': 'Teams', 'path': '/teams'}, 
        {'id': 14, 'title': 'API Access', 'path': '/api_access'}, 
        {'id': 15, 'title': 'Extensions', 'path': '/extensions', disable: true}, 
        {'id': 16, 'title': 'Account Settings', 'path': '/account_settings', disable: true}, 
        {'id': 17, 'title': 'Analytics', 'path': '/analytics', disable: true}
    ]
}, {
    'id': 18,
    'title': 'Analytics',
    'group': 'audit',
    'role': '4',
    'icon': 'area-chart',
    'children': [
        {'id': 19, 'title': 'Reports', 'path': '/reports'}, 
        {'id': 20,'title': 'Postmortems','path': '/postmortems', disable: true}
    ]
}, {
    'id': 21,
    'title': 'Command Console',
    'group': 'opt',
    'path': '/command_console',
    'role': '5',
    'icon': 'setting'
}];

export default menus;