<template>
    <span v-if="!permissionSwitch || isAllow || !isRestrict && !isObserver">
        <router-link :to="url">
            <slot></slot>
        </router-link>
    </span>
    <span v-else>
        <slot></slot>
    </span>
</template>

<script>
    import _ from 'lodash';
    import Vue from 'vue';
    import {PermissionUtil} from '@util';

    export default{
        name: 'PermissionRouterLink',
        computed: {
            url(){
                switch (this.type) {
                    case 'policy':
                        return `/policies/${this.target.id}/detail`;
                    case 'incident':
                        return `/incidents/${this.target.id}`;
                    case 'service':
                        return `/services/${this.target.id}/detail`;
                    case 'integration':
                        return `/services/${this.target.serviceId}/integration/${this.target.id}/detail`;
                    case 'maintenance':
                        return `/maintenance/${this.target.id}/${this.action || 'edit'}`;
                    case 'schedule':
                        return `/schedules/${this.target.id}/view`;
                    default:
                        return '/';
                }
            },
            isAllow(){
                switch (this.type) {
                    case 'policy':
                        return PermissionUtil.escalationPolicy.allowView(this.target);
                    case 'incident':
                        return false;
                    case 'service':
                        return PermissionUtil.service.allowView(this.target);
                    case 'integration':
                        return PermissionUtil.service.allowView({id:this.target.serviceId});
                    case 'maintenance':
                        return PermissionUtil.service.allowView({id:this.target.serviceId});
                    case 'schedule':
                        return PermissionUtil.schedule.allowView(this.target);
                    default:
                        return false;

                }
            },
            isRestrict(){
                return PermissionUtil.role.isRestrict();
            },
            isObserver(){
                return PermissionUtil.role.isObserver();
            }
        },
        props: {
            type: {
                type: String,
            },
            target: {
                type: [Object],
            },
            action: {
                type : String,
            }
        },
        data(){
            return {
                permissionSwitch: Vue.config.permissionSwitch,
            }
        },
    }
</script>