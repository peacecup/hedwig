<template>
    <div class="login">
        <Form
                ref="loginForm"
                :model="loginModal"
                :rules="ruleValidate"
                label-position="left" :label-width="100"
                @submit="login" onSubmit="return false">
            <Card>
                <p class="header">Hedwig Login</p>
                <div class="body">

                    <Form-Item label="User Name" prop="userName">
                        <Input v-model="loginModal.userName" placeholder="please input your userName"></Input>
                    </Form-Item>
                    <Form-Item label="Password" prop="password">
                        <Input v-model="loginModal.password" type="password"
                               placeholder="please input your password"></Input>
                    </Form-Item>

                </div>
                <div class="footer">
                    <Button icon="log-in" :loading="loading" htmlType="submit" class="btn-login" type="primary"
                            @click="login">Login
                    </Button>
                    <a class="forget" v-html="devMessage"></a>
                </div>
            </Card>
        </Form>
    </div>
</template>

<script>
    import _ from 'lodash';
    import store from 'store';
    import {VueUtil, FormUtil} from '@util';

    export default{
        components: {},
        computed: {
            ...VueUtil(this).select(['Users']).state(),
        },
        props: {},
        data(){
            return {
                loading:false,
                devMessage: process.env.NODE_ENV !== 'production' ? 'usr: admin<br/>pwd:000000' : '<a>forget</a>',
                loginModal: {
                    userName: '',
                    password: ''
                },
                ruleValidate: {
                    userName: [
                        {
                            required: true, message: "userName is not null", trigger: 'blur'
                        }
                    ], password: [
                        {
                            required: true, message: "password is not null", trigger: 'blur',
                        }
                    ],
                }
            }
        },
        mounted(){
        },
        watch: {
            'Users.login': 'listenLogin',
            'Users.my_additional_permission': 'listenLogin',
        },
        methods: {
            ...VueUtil(this).select(['Users']).actions(),
            listenLogin(data){
               VueUtil(this).cb(data).success(() => {
                   if(data.type === 'login'){
                       const token = _.get(data, 'data.token', null);
                       const id = _.get(data, 'data.id', null);
                       const loginEmail = _.get(data, 'data.loginEmail', null);
                       if (token) {
                           store.set('token', token);
                           store.set('id', id);
                           store.set('email', loginEmail);
                           VueUtil(this).select('Users')
                               .action('my_additional_permission',{userId: id});
                       } else {
                           this.$Message.error('userName or password is wrong!');
                           this.loading = false;
                       }
                   }else if(data.type === 'my_additional_permission'){
                       this.$router.push("/");
                   }

               }).error()
            },
            login(){

                this.$refs['loginForm'].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        VueUtil(this).select('Users').action('login',{
                            accountKey: "1",
                            ... this.loginModal,
                        });
                    } else {
                        this.$Message.error('userName or password is wrong!');
                    }
                })
            }
        }
    }
</script>