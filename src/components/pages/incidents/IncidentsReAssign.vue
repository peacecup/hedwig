<template>
    <Modal width="600px" v-model="value" title="Reassigning incident to..."
           :loading="loading" :mask-closable="false"
           @on-ok="reAssignDo"
           @on-cancel="hideModal"
    >
        <DynamicForm :dicts="dicts" :button="{enabled:false}" ref="reassignForm"
                     :editFields="editFields"
                     :submit="reAssignDo"
                     :loading="loading"
                     :formValidate="formValidate"></DynamicForm>

        <div slot="footer">
            <Button size="large" :disabled="loading" @click="$emit('input',false)">{{ $t('button.cancel')}}</Button>
            <Button type="primary" size="large" :loading="loading" @click="reAssignDo">{{ $t('button.submit')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsReAssign',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents', 'EscalationPolicies', 'Users']).state(),
        },
        props: {
            value: {
                default: false,
            },
            incidents: {
                type: Array,
            }
        },

        data(){
            return {
                loading: false,
                dicts: {
                    assignedTo: {}
                },
                formValidate: {
                    reAssign: "",
                },
                editFields: [{
                    type: 'select-group-tabs',
                    id: 'assignments',
                    label: "assignedto",
                    filterable: true,
                    span: 24,
                    options: 'assignedTo'
                }],
            }
        },
        watch: {
            "assignedTo": "listenAssignedTo",
            'Incidents.reassign': "listenIncidents",
            'EscalationPolicies.all': 'listenEscalationPolicies',
            'Users.all': 'listenUsers',
            value(val){
                this.$emit('input', val);
                if (!val) {
                    this.$refs['reassignForm'].resetForm();
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
                        case 'reassign':
                            this.$refs['reassignForm'].handleReset('formValidate');
                            this.hideModal();
                            this.loading = false;
                            break;
                    }
                }).error();
            },
            reAssignDo(){
                this.$refs['reassignForm'].validate({
                    ok: (data) => {
                        this.loading = true;
                        let $data = _.map(this.incidents, (proxy) => {
                            let assign = data.assignments.split("_");
                            if (assign[0] === 'e') {
                                return {
                                    id: proxy.id,
                                    escalation_policy: {
                                        id: assign[1],
                                    }
                                }
                            } else if (assign[0] === 'u') {
                                return {
                                    id: proxy.id,
                                    assignments: [{assignee: {id: assign[1]}, type: "assignments_reference"}],
                                }
                            }
                        });
                        VueUtil(this).select('Incidents').action('reassign', $data)
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
                    if (!_.chain(this.dicts.assignedTo).map(a => a.name).includes('EscalationPolicies').value()) {
                        this.dicts.assignedTo[0] = escalationPolicies;
                    }
                    VueUtil(this)
                        .select('Users').all();
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
                    if (!_.chain(this.dicts.assignedTo).map(a => a.name).includes('Users').value()) {
                        this.dicts.assignedTo[1] = users;
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