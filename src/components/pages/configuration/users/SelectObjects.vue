<template>
    <div class="select-objects">
        <Tabs :animated="false">
            <Tab-pane label="Services">
                <Checkbox-group v-model="selects.service" @on-change="selectChange">
                    <ul>
                        <li v-for="service in Services">
                            <Checkbox  :label="service.id">{{service.name}}</Checkbox>
                        </li>
                    </ul>
                </Checkbox-group>
            </Tab-pane>
            <Tab-pane label="Escalation Policies">
                <Checkbox-group v-model="selects.escalationPolicy" @on-change="selectChange">
                    <ul>
                        <li v-for="escalation in EscalationPolicies">
                            <Checkbox  :label="escalation.id">{{escalation.name}}</Checkbox>
                        </li>
                    </ul>
                </Checkbox-group>

            </Tab-pane>
            <Tab-pane label="Schedules">
                <Checkbox-group v-model="selects.schedule" @on-change="selectChange">
                    <ul>
                        <li v-for="schedule in Schedules">
                            <Checkbox :label="schedule.id">{{schedule.name}}</Checkbox>
                        </li>
                    </ul>
                </Checkbox-group>
            </Tab-pane>
        </Tabs>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'SelectObjects',
        components: {},
        computed: {
        },
        props: {
            Services: {},
            EscalationPolicies: {},
            Schedules: {},
            selectCb: null,
            selects:{},
            selectChange: null,
            dataMap:{}
        },
        data(){
            return {

            };
        },
        mounted(){
        },
        watch: {
            'selects.service': 'listenSelects',
            'selects.escalationPolicy': 'listenSelects',
            'selects.schedule': 'listenSelects'
        },
        methods: {
            //...VueUtil(this).select(['SelectObjects']).actions(),
            /*listenSelects(data){
                if (this.selectCb && _.isFunction(this.selectCb))
                    this.selectCb.call(this, this.selects);
            }*/
        }
    }
</script>