<template>
    <Submenu v-if="menu.children" :name="menu.id">
        <template slot="title">
            <Icon :type="menu.icon"></Icon>
            <span>{{ i18n(menu.title)}}</span></template>
        <Menu-item :name="m.path" v-for="m in menu.children" :key="m.title">
            <div v-if="m.disable">
                <span style="color: #bbbec4">{{i18n(m.title)}}</span>
            </div>
            <div v-if="!m.disable">
                {{i18n(m.title)}}

            </div>
        </Menu-item>
    </Submenu>
    <Menu-item v-else :name="menu.path">{{ i18n(menu.title)}}</Menu-item>
</template>
<script>
    import _ from 'lodash';
    import Vue from 'vue';
    import {VueUtil} from '@util';
    export default{
        name: "MenuDecorator",
        props: {
            menu: {
                type: Object
            }
        },
        methods: {
            i18n(key){
                return VueUtil(this).I18n(key);
            }
        }
    };
</script>