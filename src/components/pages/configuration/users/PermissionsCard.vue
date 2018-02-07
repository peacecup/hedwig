<template>
    <Card>
        <div slot="title">
            <slot name="title"></slot>
        </div>
        <ul>
            <li v-for="serviceId in selects.service">
                <router-link :to="`/services/${serviceId}`">{{getName('service',serviceId) }}</router-link>
                <span>Service</span>
            </li>
            <li v-for="escalationId in selects.escalationPolicy">
                <router-link :to="`/escalationpolicies/${escalationId}`">{{getName('escalationPolicy',escalationId)}}</router-link>
                <span>Escalation Policies</span>
            </li>
            <li v-for="scheduleId in selects.schedule">
                <router-link :to="`/schedules/${scheduleId}/view`">{{getName('schedule',scheduleId) }}</router-link>
                <span>Schedules</span>
            </li>
        </ul>
    </Card>
</template>

<script>
    import _ from 'lodash';

    export default{
        name: 'PermissionsCard',
        components: {},
        computed: {},
        props: {
            selects: {},
            dataMap:{}
        },
        methods:{
            getName(type,id){
                let name = this.dataMap[type].get(id).name;
                return name;
            }
        }

    };
</script>