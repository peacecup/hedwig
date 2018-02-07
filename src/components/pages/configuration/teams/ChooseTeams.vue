<template>
    <div class="choose-teams">
        <div class="title" @click="showBody = true">{{choosed !== null ? choosed.name : "All Teams"}}</div>
        <transition name="slide-up">
            <div class="body" v-if="showBody">
                <Tabs :value="chooseTab" :animated="false" @on-click="onChooseTab">
                    <Tab-pane name="my" label="My Teams">
                        <div v-if="myTeams === null" style="padding: 5px;">
                            You are not on any teams yet. <br>
                            <a href="javascript:void(0)" @click="gotoTeams">Add yourself to a team</a> to focus your PagerDuty experience on the information that is most relevant to you.

                        </div>
                        <div v-else>
                            <Input @on-change="searchName" v-model="name" placeholder="search teams..." icon="search"/>
                            <div v-if="name === ''" class="team-item" @click="chooseTeam(null)">All Teams</div>
                            <template v-if="name && (myTeams.length === 0)">
                                <div class="text-align-center top-bottom-10">not match</div>
                            </template>
                            <template v-else>
                                <div :class="`team-item ${choosed !== null && team.id === choosed.id ?'team-item-selected':''}`"
                                     @click="chooseTeam(team)" v-for="team in myTeams">{{team.summary || team.name}}
                                </div>
                            </template>
                        </div>
                    </Tab-pane>
                    <Tab-pane name="all" label="All Teams">
                        <Input @on-change="searchName" v-model="name" placeholder="search teams..." icon="search"/>
                        <div v-if="name === ''" class="team-item" @click="chooseTeam(null)">All Teams</div>
                        <template v-if="name && (!allTeams || allTeams.length === 0)">
                            <div class="text-align-center top-bottom-10">not match</div>
                        </template>
                        <template v-else>
                            <div :class="`team-item ${choosed !== null && team.id === choosed.id ?'team-item-selected':''}`"
                                 @click="chooseTeam(team)" v-for="team in allTeams">{{team.summary || team.name}}
                            </div>
                        </template>
                    </Tab-pane>
                </Tabs>
            </div></transition>
            <div class="mask-layer" v-show="showBody"
                 @click="closeMasklayer"></div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import store from 'store';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'ChooseTeams',
        components: {},
        computed: {
            ...VueUtil(this).select(['Teams', 'Users']).state(),
        },
        props: {},

        data(){
            return {
                showBody: false,
                chooseTab: 'my',
                myTeams: [],
                allTeams: [],
                name: "",
                choosed: {name: "All Teams"},
            };
        },
        mounted(){

            if (store.get("team")) {
                this.choosed = store.get("team");
                this.chooseTeam(this.choosed);
            } else {
                this.choosed = null;
            }
        },
        watch: {
            "Users.me": "listenUsers",
            "Teams.all": "listenTeams",
            showBody(nVal){
                if (nVal) {
                    VueUtil(this).select("Teams").all();
                }
            }
        },
        methods: {
            ...VueUtil(this).select(['Teams', 'Users']).actions(),
            onChooseTab(name){
                this.chooseTab = name;
            },
            listenUsers(get){
                VueUtil(this).cb(get).success(() => {
                    this.myTeams = get.data.teams.length === 0 ? null : get.data.teams;
                })
            },
            listenTeams(all){
                VueUtil(this).cb(all).success(() => {
                    if (all.type === 'all') {
                        this.allTeams = all.data.list;
                    }
                })
            },
            gotoTeams(){
                this.$router.push("/teams");
                this.showBody = false;
            },
            chooseTeam(team){
                if (team !== null) {
                    team = {id: team.id, name: team.name || team.summary};
                }
                store.set("team", team);
                VueUtil(this).select("Teams").action("choose", team);
                this.choosed = team;
                this.showBody = false;
            },
            searchName(){
                VueUtil(this).select("Teams").all({name: this.name});
                this.myTeams = _.filter(this.Users.me.data.teams, team => team.summary.indexOf(this.name) > -1);
            },
            closeMasklayer(){
                this.showBody = false;
            }
        }
    }
</script>