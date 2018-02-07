<template>
    <div>
        <Row>
            <Col span="19">
            <ResponderHandler></ResponderHandler>
            <IncidentsMain ref="incidentsMain"></IncidentsMain>
            <LogEntries :user="`all`"></LogEntries>
            </Col>
            <Col span="5">
            <Row>
                <Col span="24" v-key="`incident.new`" >
                <Button type="success" icon="plus" class="w-100p text-align-left"
                        @click="openModal">
                    {{ I18n('new incidents') }}
                </Button>
                </Col>
                <Col span="24">
                <Card style="margin: 10px 0px;">
                    <p slot="title">
                        Next Steps: Your Tools
                    </p>
                    <div>
                        <p>Add all your tools to begin monitoring your systems today:</p>
                        <Button v-key="`service.new`" class="w-100p text-align-left" icon="plus" @click="newService">
                            {{ I18n('add service') }}
                        </Button>
                    </div>
                </Card>
                </Col>
            </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import IncidentsTools from './IncidentsTools.vue';
    import IncidentsMain from './IncidentsMain.vue';
    import ResponderHandler from './ResponderHandler.vue';
    import LogEntries from './LogEntries.vue';

    export default{
        components: {IncidentsTools, IncidentsMain, ResponderHandler, LogEntries},
        computed: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            newService(){
                this.$router.push("/services/add");
            },
            openModal(){
                this.$refs['incidentsMain'].openModal();
            },
            gotoCreateSchedule(){
                this.$router.push("/schedules/new");
            },
        },
        mounted(){
        },
        data(){
            return {
                title:'aa',
                status: 1,
                loading: false,
                modal: false,
            }
        }
    }
</script>