<template>
    <Modal width="600px" v-model="value" title="Responder incident to..."
           :loading="loading" :mask-closable="false"
           @on-ok="responderDo"
           @on-cancel="hideModal"
    >
        <DynamicForm :dicts="dicts" :button="{enabled:false}" ref="responderForm"
                     :editFields="editFields"
                     :submit="responderDo"
                     :loading="loading"
                     :formValidate="formValidate"></DynamicForm>
        <div slot="footer">
            <Button size="large" :disabled="loading" @click="$emit('input', false)">{{ $t('button.cancel')}}</Button>
            <Button type="primary" size="large" :loading="loading" @click="responderDo">{{ $t('button.submit')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsResponder',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents', 'EscalationPolicies', 'Users']).state(),
        },
        props: {
            value: {
                default: false,
            },
            incidents: Array,
        },

        data(){
            return {
                loading: false,
                dicts: {
                    responderTo: {}
                },
                formValidate: {
                    responders: [],
                },
                editFields: [
                    {
                        type: 'select-group-tabs',
                        id: 'responders',
                        label: "Responder",
                        filterable: true,
                        span: 24,
                        options: 'responderTo',
                        multiple: true,
                        clearable: true,
                    },
//                    {
//                        type: 'textarea',
//                        id: 'message',
//                        label: "Message",
//                        defaultValue: `Please help with "${this.incidents[0].title}"`,
//                        rows: 4,
//                        span: 24,
//                    }
                ],
            }
        },
        mounted(){

        },
        watch: {
            'Incidents.responder': "listenIncidents",
            'EscalationPolicies.all': 'listenEscalationPolicies',
            'Users.all': 'listenUsers',
            value(val){
                this.$emit('input', val);
                if (!val) {
                    this.$refs['responderForm'].resetForm();
                } else {
                    this.loading = true;
                    VueUtil(this)
                        .select('EscalationPolicies').all();
                }
            }
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'EscalationPolicies', 'Users']).actions(),
            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    switch (data.type) {
                        case 'responder':
                            this.$refs['responderForm'].handleReset('formValidate');
                            this.hideModal();
                            this.loading = false;
                            break;
                    }
                }).error()
            },
            responderDo(){
                this.$refs['responderForm'].validate({
                    ok: (data) => {
                        this.loading = true;
                        VueUtil(this).select('Incidents').action('responder', data, (proxy) => {
                            let incident = _.cloneDeep(proxy);
                            incident.incidents_responders = _.map(incident.responders, res => {
                                return {
                                    user: {
                                        id: res.split('_')[1],
                                    },
                                    message: incident.message,
                                };
                            });
                            incident.responders = null;
                            incident.id = this.incidents[0].id;
                            return incident;
                        })
                    }, err: () => {
                        this.loading = false;
                    }
                });

            },
            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    let escalationPolicies = {
                        name: "EscalationPolicies",
                        list: _.map(data.data.list, u => {
                            return {label: u.summary, value: `e_${u.id}`};
                        })
                    }
                    if (!_.chain(this.dicts.responderTo).map(a => a.name).includes('EscalationPolicies').value()) {
                        this.dicts.responderTo[0] = escalationPolicies;
                    }
                    VueUtil(this)
                        .select('Users').all()
                }).error()
            },
            listenUsers(data){
                VueUtil(this).cb(data).success(() => {
                    let users = {
                        name: "Users",
                        list: _.map(data.data.list, u => {
                            return {label: u.name, value: `u_${u.id}`};
                        })
                    }
                    if (!_.chain(this.dicts.responderTo).map(a => a.name).includes('Users').value()) {
                        this.dicts.responderTo[1] = users;
                    }
                    this.loading = false;
                }).error()
            },
            hideModal(){
                this.$emit('input', false);
            }
        }
    }
</script>