//Do not modify this file, it will be autogenerated
{{#list}}
import {{this.name}}  from '{{this.fullName}}';
{{/list}}

const commonComponents = {
{{#list}}
    {{this.name}} : {
       install : (Vue) =>{
           Vue.component('{{this.name}}',{{this.name}} );
       }
    },
    {{/list}}
}
export default commonComponents;