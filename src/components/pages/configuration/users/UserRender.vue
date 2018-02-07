<template>
    <div>
        <!--{{userInfo.name}}-->
        <slot name="body"></slot>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'UserRender',
        components: {},
        computed: {
            ...VueUtil(this).select(['Users']).state(),
        },
        props: {
            "userId":null,
        },

        data(){
            return {
                userInfo: null,
            }
        },
        mounted(){
            if(_.isNull(_.get(this.Users,"all.data.list",null))){
                VueUtil(this).select("Users").all();
            }else{

                let userInfos = _.filter(this.Users.all.data.list,{id:this.userId});
                if(userInfos.length === 1)
                this.userInfo = userInfos[0];
            }
        },
        watch: {
            "Users.all":"listenUsers"
        },
        methods: {
            ...VueUtil(this).select(['Users']).actions(),
            listenUsers(all){
                VueUtil(this).cb(all).success(()=>{
                    this.userInfo = _.filter(all.data.list,{id:this.userId});
                });
            }
        }
    }
</script>