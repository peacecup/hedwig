<template>
    <div>
        <Dropdown trigger="click" :placement="placement" :transfer="true" @on-click="select">
            <Button :size="size" icon="gear-b" href="javascript:void(0)" :style="{width:width}">
                <span>{{title}}</span>
                <Icon type="arrow-down-b"></Icon>
            </Button>
            <Dropdown-menu slot="list">
                <Dropdown-item v-key="menu.key" :name="`${menu.type}/${id}`" v-for="menu in finalList" :key="menu.id">
                    <Icon :type="menu.icon"></Icon>
                    <span>{{menu.title}}</span>
                </Dropdown-item>
            </Dropdown-menu>
        </Dropdown>
    </div>
</template>
<script>
    import { PermissionUtil } from '@util';
    import _ from 'lodash';

    export default {
        name: 'DropMenuDecorator',
        computed: {
          finalList(){
              if(this.target && this.id){
                  return _.map(this.list, item => {
                      let allow = false;
                      if(item.type === 'view' && PermissionUtil[this.target].allowView({id: this.id})) {
                          allow = true;
                      }else if( PermissionUtil[this.target].allowEdit({id: this.id})){
                          allow = true;
                      }
                      if(allow) {
                          return {
                              ...item,
                              key: {
                                  ... item.key,
                                  ignore : true,
                              }
                          }
                      }else{
                          return item;
                      }
                  });
              }else {
                  return this.list;
              }
          }
        },
        props: {
            id: {
                type: [String, Number],
            },
            title: {
                type: String
            },
            select: {
                type: [Function],
            },
            list: {
                type: Array,
                default: [],
            },
            width: {
                type: [String, Number],
            },
            target: {
                type: [String],
            },
            size: {
                default: function () {
                    return 'small';
                }
            },
            placement: {
                default: function () {
                    return 'bottom-end';
                }
            }
        }
    }
</script>
