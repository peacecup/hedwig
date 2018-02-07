<template>
    <div class="user-detail">
        <Row>
            <Col span="19">
            <div class="title">
                <!--<Avatar shape="square" icon="person" size="large"/>-->
                <div class="name">
                    <h1>
                        <Icon type="person" size="large"></Icon>
                        {{Users.get.data.name}}

                    </h1>
                </div>
            </div>
            <div class="body">

                <Tabs :value="currentTab" :animated="false" @on-click="clickTab">
                    <Tab-pane name="ContactInformation" label="Contact Information">
                        <ContactInformation :userinfo="userinfo"
                                            @refreshContactInfo="refreshContactInfo"></ContactInformation>
                    </Tab-pane>
                    <Tab-pane name="NotificationRules" label="Notification Rules">
                        <NotificationRules :userinfo="userinfo"></NotificationRules>
                    </Tab-pane>
                    <Tab-pane name="UserSettings" label="User Settings">
                        <UserSettings :userinfo="userinfo"></UserSettings>
                    </Tab-pane>
                        <Tab-pane name="Permissions" label="Permissions">
                            <Permissions :role="userinfo.role" @Pchange="PermissionChange"></Permissions>
                        </Tab-pane>
                    <Tab-pane name="On-Call Timeline" label="On-Call Timeline">
                        <UserOnCallTimeLine :user="userinfo"></UserOnCallTimeLine>
                    </Tab-pane>
                </Tabs>
            </div>
            </Col>
            <Col span="5">
            <Row>

                <Col span="24">
                <Card>
                    <div slot="title"><strong>Upcoming On-Call</strong></div>
                    <div>
                        <UpcomingOnCall :user="userinfo"></UpcomingOnCall>
                    </div>
                </Card>
                </Col>
                <Col span="24">
                <Card>
                    <div slot="title"><strong>On-Call Schedules</strong></div>
                    <div>
                        <ScheduleOnCall :user="userinfo"></ScheduleOnCall>
                    </div>
                </Card>
                </Col>
                <Col span="24">
                <Card>
                    <div slot="title"><strong>Teams</strong></div>
                    <div v-if="userinfo.teams">
                        <div v-for="team in userinfo.teams" class="top-bottom-5">
                            <Icon type="ios-people"></Icon>
                            <router-link :to="`/teams/${team.id}/detail`">{{team.summary}}</router-link>
                        </div>
                    </div>
                </Card>
                </Col>
            </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import NotificationRules from './NotificationRules.vue';
    import ContactInformation from './ContactInformation.vue';
    import UserSettings from './UserSettings.vue';
    import Permissions from './Permissions.vue';
    import UpcomingOnCall from './UpcomingOnCall.vue';
    import ScheduleOnCall from './ScheduleOnCall.vue';
    import UserOnCallTimeLine from './UserOnCallTimeLine.vue';
    import {VueUtil, FormUtil} from '@util';

    export default{
        components: {
            NotificationRules,
            ContactInformation,
            UserSettings,
            Permissions,
            UpcomingOnCall,
            ScheduleOnCall,
            UserOnCallTimeLine,
        },
        computed: {
            ...VueUtil(this).select(['Users']).state(),
            isMe(){
                return this.userinfo.id === this.Users.me.data.id;
            }
        },
        props: {},

        data(){
            return {
                userinfo: {},
                currentTab: null,
            }
        },
        mounted(){
            VueUtil(this).select('Users').get({
                id: this.$route.params.id,
                include: ['teams', 'contact_methods'],
            });
            this.currentTab = this.$route.params.tab;
        },
        watch: {
            "Users.get": "listenUsers"
        },
        methods: {
            ...VueUtil(this).select(['Users']).actions(),
            clickTab(name){
                this.currentTab = name;
                this.$router.push(`/users/${this.$route.params.id}/${name}`)
            },
            PermissionChange(){
                VueUtil(this).select('Users').get({
                    id: this.$route.params.id,
                    include: ['teams', 'contact_methods'],
                });
                //this.currentTab = this.$route.params.tab;
            },

            refreshContactInfo() {
                VueUtil(this).select('Users').get({
                    id: this.$route.params.id,
                    include: ["contact_methods"]
                });
                this.currentTab = this.$route.params.tab;
            },
            listenUsers(data){
                if (!data.loading) {
                    if (!data.data.color)
                        data.data.color = "#ffffff";
                    this.userinfo = {
                        name: "",
                        email: "",
                        time_zone: "",
                        color: "",
                        role: "",
                        avatar_url: "",
                        description: "",
                        invitation_sent: "",
                        job_title: "",
                        teams: [],
                        ...data.data,
                    }
                    if (!data.data.contact_methods) {
                        this.userinfo.contact_methods = [];
                    }
                    if (!data.data.notification_rules) {
                        this.userinfo.notification_rules = [];
                    }
                }
            }
        }
    }
</script>