<template>
    <div>
        <Form>
            <Input type="textarea" v-model="note.content"/>
        </Form>
        <div class="top-bottom-5">
            <Button v-key="'incident.add_note'" :disabled="note.content === ''" type="success" @click="saveNote">Add note</Button>
        </div>
        <Table size="small" height="400" :columns="columns" :data="notes" v-if="notes && notes.length > 0"></Table>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'Note',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents']).state(),
        },
        props: ['incident'],

        data(){
            return {
                note: {
                    content: ""
                },
                notes: [],
                columns: [
                    {
                        key: "created_at",
                        title: "Time",
                        width: "200px",
                        render: (h, param) => {
                            return moment(param.row.created_at).format(this.$t('date.MDTime'));
                        }
                    },
                    {
                        key: "user",
                        title: "User",
                        width: "200px",
                        render: (h, param) => {
                            return h('router-link', {
                                props: {
                                    to: `/users/${param.row.user.id}`
                                }
                            }, param.row.user.summary);
                        }
                    },
                    {
                        key: "content",
                        title: "Note",
                    },
                ]
            }
        },
        mounted(){
        },
        watch: {
            'incident': 'listenIncident',
            'Incidents.note_list': 'listenIncidentNotes',
            'Incidents.note_save': 'listenIncidentNotes',
        },
        methods: {
            ...VueUtil(this).select(['Incidents']).actions(),
            listenIncident(incident){
                if (incident) {
                    this.refreshNotes();
                }
            },
            refreshNotes(){
                VueUtil(this).select("Incidents").action('note_list', {incidentId: this.incident.id});
            },
            listenIncidentNotes(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'note_list') {
                        this.notes = data.data.list;
                    } else if (data.type === 'note_save') {
                        this.$Message.success('save note success!');
                        this.refreshNotes();
                        this.note.content = '';
                    }
                }).error();
            },
            saveNote(){
                VueUtil(this).select("Incidents").action('note_save', {
                    incidentId: this.incident.id,
                    content: this.note.content,
                })
            }
        }
    }
</script>