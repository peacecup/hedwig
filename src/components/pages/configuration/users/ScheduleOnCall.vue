<template>
    <ul>
        <Spin fix size="large" v-if="Schedules.listByUser.loading"></Spin>
        <li v-for="schedule in schedules">
           <Icon type="calendar"></Icon> <permission-router-link :target="schedule" type="schedule">{{schedule.name}}</permission-router-link>
        </li>
    </ul>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'ScheduleOnCall',
        components: {},
        computed: {
            ...VueUtil(this).select(['Users', 'Schedules']).state(),
        },
        destroyed(){
          VueUtil(this).select('Schedules').clear('listByUser') ;
        },
        props: {
            user: {
                type: Object,
            }
        },

        data(){
            return {
                schedules: [],
            }
        },
        mounted(){
        },
        watch: {
            user(val) {
                this.getSchedulesByUser(val);
            },
            'Schedules.listByUser': 'listenSchedules',
        },
        methods: {
            ...VueUtil(this).select(['Users', 'Schedules', 'EscalationPolicies']).actions(),
            getSchedulesByUser(user){
                VueUtil(this).select('Schedules').action('listByUser',{
                    userId: [user ? user.id : this.user.id],
                    include:['escalation_policies'],
                });
            },
            listenSchedules(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'listByUser') {
                        this.schedules = data.data.list;
                    }
                }).error();
            }
        }
    }
</script>