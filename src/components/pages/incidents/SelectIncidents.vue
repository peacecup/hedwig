<template>
    <div class="select-objects">
        <Tabs :animated="false">
            <Tab-pane label="Selected Incidents">
                <Spin fix size="large" v-if="loading"></Spin>
                <div style="text-align: center;color:#bbbec4;padding-bottom: 10px;" v-if="incident1.length === 0">
                    No match
                </div>
                <Checkbox-group @on-change="selectChange">
                    <ul class="ul">
                        <li v-for="incident in incident1">
                            <Checkbox :label="incident"><strong>#{{incident.incident_number}}</strong> {{incident.title}}</Checkbox>
                        </li>
                    </ul>
                </Checkbox-group>
            </Tab-pane>
            <Tab-pane label="Assigned to me">
                <Spin fix size="large" v-if="loading"></Spin>
                <div style="text-align: center;color:#bbbec4;padding-bottom: 10px;" v-if="incident2.length === 0">
                    No match
                </div>
                <Checkbox-group @on-change="selectChange">
                    <ul class="ul">
                        <li v-for="incident in incident2">
                            <Checkbox :label="incident"><strong>#{{incident.incident_number}}</strong> {{incident.title}}</Checkbox>
                        </li>
                    </ul>
                </Checkbox-group>
            </Tab-pane>
            <Tab-pane label="Assigned to my team">
                <Spin fix size="large" v-if="loading"></Spin>
                <div style="text-align: center;color:#bbbec4;padding-bottom: 10px;" v-if="incident3.length === 0">
                    No match
                </div>
                <Checkbox-group @on-change="selectChange">
                    <ul class="ul">
                        <li v-for="incident in incident3">
                            <Checkbox :label="incident"><strong>#{{incident.incident_number}}</strong> {{incident.title}}</Checkbox>
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
        name: 'SelectIncidents',
        components: {},
        computed: {},
        props: {
            loading:{
                type: Boolean,
                default:false,
            },
            incident1: {
                type: Array,
                default: [],
            },
            incident2: {
                type: Array,
                default: [],
            },
            incident3: {
                type: Array,
                default: [],
            },
            selectCb: {
                type: Function,
            },
            selects: {
                type: [Object, Array],
            },

        },
        watch:{

        },

        data(){
            return {
            }
        },
        mounted(){
        },
        methods: {
            selectChange(data){
                if (this.selectCb && _.isFunction(this.selectCb))
                    this.selectCb.call(this, data[0]);
            },
        }
    }
</script>
<style lang="less" scoped>
    .ivu-checkbox-wrapper {
        width: 100%;
        padding: 5px 5px;
        &:hover {
            background: #e9eaec;
        }
    }

    .ul {
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 150px;
    }
</style>