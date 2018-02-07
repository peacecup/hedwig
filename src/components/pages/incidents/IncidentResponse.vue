<template>
    <Row>
        <Col span="10">
        <h2>PEOPLE</h2>
        <div class="divider top-bottom-10"></div>
        <div class="top-bottom-10">
            <h2>Assigned to<Button v-key="{key:`incident.reassign`,ignore:permission}" icon="navigate"
                                            style="position: absolute;right: 10px;" size="small"
                                            :disabled="incident.status === 'resolved'" @click="$emit('openReassign')">Reassign</Button>
            </h2>
            <div class="top-bottom-10">
                <template v-for="assignment in incident.assignments">
                    <div>
                        <Row type="flex">
                            <Col style="width: 50px">
                            <Avatar shape="square" icon="person" size="large"/>
                            </Col>
                            <Col style="width: 300px;">
                            <div>
                                <router-link :to="`/users/${_.get(assignment, 'assignee.id', '')}`">
                                    {{_.get(assignment, 'assignee.summary', '')}}
                                                    </router-link>
                            </div>
                            <div>
                                assign_at {{ moment(_.get(assignment, 'at')).format($t('date.MDTime')) }}

                                                </div>
                            </Col>
                        </Row>
                    </div>
                </template>
            </div>
        </div>
        <div class="top-bottom-10">
            <h2>Responder




                                    <Button v-key="{key:`incident.add_responder`,ignore:permission}" icon="person-add"
                                            style="position: absolute;right: 10px" size="small"
                                            :disabled="incident.status === 'resolved'"
                                            @click="$emit('openResponder')">Add Responders




                                    </Button>
            </h2>
            <div class="top-bottom-10">
                <template v-for="responder in incident.incidents_responders">
                    <p>
                        <Row type="flex">
                            <Col style="width: 50px">
                            <Avatar shape="square" icon="person" size="large"/>
                            </Col>
                            <Col style="width: 300px;">
                            <div>
                                <router-link :to="`/users/${_.get(responder, 'user.id', '')}`">
                                    {{_.get(responder, 'user.summary', '')}}
                                                    </router-link>
                                requested_at {{moment(_.get(responder, 'requested_at')).format($t('date.MDTime')) }}

                                                </div>
                            <div>
                                {{_.get(responder, 'message')}}

                                                </div>
                            </Col>
                        </Row>
                    </p>
                </template>
            </div>
        </div>

        </Col>
        <Col span="14">
        <h2>NOTES</h2>
        <div class="divider top-bottom-10"></div>
        <Note :incident="incident"></Note>
        </Col>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import Note from './Note.vue';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentResponse',
        components: {Note},
        computed: {
            //...VueUtil(this).select(['IncidentResponse']).state(),
        },
        props: {
            incident: {
                type: Object,
            },
            permission:{
                type: Boolean,
                default: false,
            },
        },

        data(){
            return {}
        },
        mounted(){
        },
        watch: {},
        methods: {
            //...VueUtil(this).select(['IncidentResponse']).actions(),
        }
    }
</script>