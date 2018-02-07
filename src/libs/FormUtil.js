/**
 * Created by binwang on 17/8/24.
 */
import  _ from 'lodash';

//表单工具类
//根据scope的不同来对同一份数据进行处理，形成动态表单
function util(_context) {
    "use strict";
    let fields = [];

    let $this = _context;

    //默认的查询参数
    this.defaultQuery = (_q = {}) => {
        return {
            offset: 1,
            limit: 10,
            filter: null,
            sortField: null,
            sortOrder: null,
            ..._q
        };
    }
    this.initFields = (fields) => {
        this.fields(fields);
        return this;
    }
    //根据传入的field，填充fields字段，并且排序返回
    this.fields = (field) => {
        if (_.isArray(field)) {
            field.map(f => this.fields(f));
        } else if (_.isObject(field)) {
            fields.push(field);
        } else {
            return _.sortBy(fields, f => f.formIndex);
        }
    }
    //根据field中的scope字段是否包含form来过滤出可以修改的字段
    this.editFields = () => {
        //chain函数开始一个函数式编程链
        return _.chain(fields).filter(f => {
            return !f.scope || _.indexOf(f.scope, 'form') > -1;
        }).map(f => {
            return {
                onchange: () => {},
                onclick: () => {},
                onfocus: () => {},
                onblur: () => {},
                ...f
            };
        }).sortBy(f => f.formIndex).value();
    }
    this.forms = () => {
        var forms = {};
        _.forEach(fields, f => {
            if (!f.scope || _.indexOf(f.scope, 'form') > -1) {
                let initValue = null;
                if (f.type === 'select' && f.multiple || f.type === 'checkbox') {
                    initValue = []
                }
                _.assign(forms, {[f.id]: f.defaultValue || initValue});
            }
        });
        return forms;
    }
    let I18n = (key) =>{
        if(!key) return '';

        return  _.reduce(key.split(' '), (n1,n2)=> {
            if(/^[A-Za-z\s]+$/.test(n1))
                n1 = n1 +' ';
            return n1 + $this.$t(`h.${_.lowerCase(n2)}`);
        },'');
    }
    this.columns = () => {
        return _.chain(fields).filter(f => {
            return f.type !== 'hidden' && (!f.scope || _.indexOf(f.scope, 'column') > -1);
        }).map(f => {
            return {
                key: f.id,
                title: I18n(f.label),
                ...f
            }
        }).value();
    }
    this.rules = () => {
        var rules = {};
        _.forEach(fields, f => {
            if (!f.scope || _.indexOf(f.scope, 'form') > -1)
                _.assign(rules, {[f.id]: f.rules || null})
        });
        return rules;
    }
    this.queryFields = () => {
        var queryFields = _.filter(fields, f => {
            if (!f.scope || _.indexOf(f.scope, 'searchForm') > -1)
                return true
        });
        return queryFields;
    };
    this.validator = {
        noSpecialWord: (rule, value, callback, source, options) =>{
            var errors = [];
            if (/[/\\\&\<\>\']/.test(value)) {
                callback($this.$t("valid.noSpecial"));
            }
            callback(errors);
        }
    }
}

export default (context) => new util(context);
