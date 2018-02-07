<template>
    <div class="service-settings">
        <h2>General Settings</h2>
        <Row>
            <Col span="3" style="text-align: right">
            Team</Col>
            <Col span="21">
            <span style="margin-right:20px;" v-for="team in service.teams">
                    <router-link :to="`/teams/${team.id}/detail`">{{team.summary}}</router-link>
                </span>
            </Col>
        </Row>
        <h2>Incident Settings</h2>
        <Row>
            <Col span="3" style="text-align: right">
            Escalation Policy</Col>
            <Col span="21">
            <permission-router-link v-if="service.escalation_policy" :target="service.escalation_policy" type="policy">
                {{service.escalation_policy.summary}}
            </permission-router-link>
            </Col>
        </Row>
        <Row>
            <Col span="3" style="text-align: right">
            Responder Notifications</Col>
            <Col span="21">
            <div v-if="service.incident_urgency_rule && service.incident_urgency_rule.urgency === 'high'">
                Notify responders until someone responds, escalate as needed (use high-urgency notification rules)
            </div>
            <div v-if="service.incident_urgency_rule && service.incident_urgency_rule.urgency === 'low'">
                Notify responders, do not escalate (use low-urgency notification rules)
            </div>

            </Col>
        </Row>
        <Row>
            <Col span="3" style="text-align: right">
            Incident Ack Timeout</Col>
            <Col span="21">
            <div v-if="service.acknowledgement_timeout !== null">
                Enabled: Acknowledged incidents will time out after {{service.acknowledgement_timeout / 60}} Min
            </div>

            </Col>
        </Row>
        <Row>
            <Col span="3" style="text-align: right">
            Incident Auto-Resolution</Col>
            <Col span="21">
            <div v-if="service.auto_resolve_timeout !== null">
                Enabled: Open incidents will auto-resolve in {{service.auto_resolve_timeout / 60}} Min
            </div>

            </Col>
        </Row>
        <Row>
            <Col span="3" style="text-align: right">
            Incident Behavior</Col>
            <Col span="21">
            <span v-if="service.alert_creation !=='create_incidents'">None: </span>An event will create an incident that cannot be merged.
            </Col>
        </Row>
        <Row>
            <Col span="3" style="text-align: right">
            Alert Grouping Behavior</Col>
            <Col span="21">
            <span v-if="service.alert_creation !=='create_alerts_and_incidents'">None: </span>An event will create an alert and then add it to a new incident. These incidents can be merged.

            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'ServiceSettings',
        components: {},
        computed: {
            ...VueUtil(this).select(['Services']).state(),
        },
        props: {
            "service": {
                type: Object,
                default: {}
            }
        },

        data(){
            return {}
        },
        mounted(){
        },
        watch: {},
        methods: {
            ...VueUtil(this).select(['Services']).actions(),
        }
    }
</script>