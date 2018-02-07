<template>
    <div>
        <span :style="`color:${color}`">{{ logEntry.note || type }}</span> by <router-link :to="`/${_.get(logEntry,'agent.type')}s/${_.get(logEntry,'agent.id')}/detail`">{{ _.get(logEntry,'agent.summary')}}</router-link> through the {{ _.get(logEntry,'channel.type') }}
        <p v-if="logEntry.event_details">Description: {{_.get(logEntry,'event_details.description')}}</p>
    </div>
</template>
<script>
    import {Dicts} from '@util';
    export default{
        name: 'LogEntryDescription',
        computed: {
            type(){
                if(this.logEntry.type){
                    return this.logEntry.type.replace(/_log_entry/g,'').replace(/_/g,' ');
                }else
                    return "";
            },
            color(){
                if(Dicts.incident_status[this.type])
                    return Dicts.incident_status[this.type].color;
                else{
                    return '';
                }
            }
        },
        props: {
            logEntry: {
                type : [Object],
            },
        },
    }
</script>