import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Icon } from '/@/components/Icon';
import { duplicateCheck } from '../user/user.api';
import { ajaxGetDictItems, checkPermDuplication } from './menu.api';
import { render } from '/@/utils/common/renderUtils';

// 统一配置帮助提示属性
const MENU_HELP_PROPS = {
  placement: 'top',
  maxWidth: '480px',
};

const isDir = (type) => type === 0;
const isMenu = (type) => type === 1;
const isButton = (type) => type === 2;

// 定义可选择的组件类型
export enum ComponentTypes {
  Default = 'layouts/default/index',
  IFrame = 'sys/iframe/FrameBlank',
}

export const columns: BasicColumn[] = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    width: 200,
    align: 'left',
  },
  {
    title: '菜单类型',
    dataIndex: 'menuType',
    width: 150,
    customRender: ({ text }) => {
      return render.renderDict(text, 'menu_type');
    },
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 50,
    customRender: ({ record }) => {
      return h(Icon, { icon: record.icon });
    },
  },
  {
    title: '组件',
    dataIndex: 'component',
    align: 'left',
    width: 150,
  },
  {
    title: '路径',
    dataIndex: 'url',
    align: 'left',
    width: 150,
  },
  {
    title: '排序',
    dataIndex: 'sortNo',
    width: 50,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '菜单名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'menuType',
    label: '菜单类型',
    component: 'RadioButtonGroup',
    defaultValue: 0,
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '一级菜单', value: 0 },
          { label: '子菜单', value: 1 },
          { label: '按钮/权限', value: 2 },
        ],
        onChange: (e) => {
          const { updateSchema, clearValidate } = formActionType;
          const label = isButton(e) ? '按钮/权限' : '菜单名称';
          //清除校验
          clearValidate();
          updateSchema([
            {
              field: 'name',
              label: label,
            },
            {
              field: 'url',
              required: !isButton(e),
            },
          ]);
          //update-begin---author:wangshuai ---date:20220729  for：[VUEN-1834]只有一级菜单，才默认值，子菜单的时候，清空------------
          if (isMenu(e) && !formModel.id && (formModel.component == 'layouts/default/index' || formModel.component == 'layouts/RouteView')) {
            formModel.component = '';
          }
          //update-end---author:wangshuai ---date:20220729  for：[VUEN-1834]只有一级菜单，才默认值，子菜单的时候，清空------------
        },
      };
    },
  },
  {
    field: 'name',
    label: '菜单名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'parentId',
    label: '上级菜单',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      //update-begin---author:wangshuai ---date:20230829  for：replaceFields已过期，使用fieldNames代替------------
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },
      //update-end---author:wangshuai ---date:20230829  for：replaceFields已过期，使用fieldNames代替------------
      dropdownStyle: {
        maxHeight: '50vh',
      },
      getPopupContainer: (node) => node?.parentNode,
    },
    ifShow: ({ values }) => !isDir(values.menuType),
  },
  {
    field: 'url',
    label: '访问路径',
    component: 'Input',
    required: true,
    //update-begin-author:liusq date:2023-06-06 for: [issues/5008]子表数据权限设置不生效
    ifShow: ({ values }) => !(values.component === ComponentTypes.IFrame && values.internalOrExternal),
    //update-begin-author:zyf date:2022-11-02 for: 聚合路由允许路径重复
    dynamicRules: ({ model, schema, values }) => {
      return checkPermDuplication(model, schema, values.menuType !== 2 ? true : false);
    },
    //update-end-author:zyf date:2022-11-02 for: 聚合路由允许路径重复
    //update-end-author:liusq date:2022-06-06 for:  [issues/5008]子表数据权限设置不生效
  },
  {
    field: 'component',
    label: '前端组件',
    component: 'Input',
    componentProps: {
      placeholder: '请输入前端组件',
    },
    defaultValue: 'layouts/default/index',
    required: true,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'componentName',
    label: '组件名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入组件名称',
    },
    helpMessage: [
      '此处名称应和vue组件的name属性保持一致。',
      '组件名称不能重复，主要用于路由缓存功能。',
      '如果组件名称和vue组件的name属性不一致，则会导致路由缓存失效。',
      '非必填，留空则会根据访问路径自动生成。',
    ],
    defaultValue: '',
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'frameSrc',
    label: 'Iframe地址',
    component: 'Input',
    rules: [
      { required: true, message: '请输入Iframe地址' },
      { type: 'url', message: '请输入正确的url地址' },
    ],
    ifShow: ({ values }) => !isButton(values.menuType) && values.component === ComponentTypes.IFrame,
  },
  {
    field: 'redirect',
    label: '默认跳转地址',
    component: 'Input',
    ifShow: ({ values }) => isDir(values.menuType),
  },
  {
    field: 'perms',
    label: '授权标识',
    component: 'Input',
    ifShow: ({ values }) => isButton(values.menuType),
    // dynamicRules: ({ model }) => {
    //   return [
    //     {
    //       required: false,
    //       validator: (_, value) => {
    //         return new Promise((resolve, reject) => {
    //           let params = {
    //             tableName: 'sys_permission',
    //             fieldName: 'perms',
    //             fieldVal: value,
    //             dataId: model.id,
    //           };
    //           duplicateCheck(params)
    //             .then((res) => {
    //               res.success ? resolve() : reject(res.message || '校验失败');
    //             })
    //             .catch((err) => {
    //               reject(err.message || '校验失败');
    //             });
    //         });
    //       },
    //     },
    //   ];
    // },
  },
  {
    field: 'permsType',
    label: '授权策略',
    component: 'RadioGroup',
    defaultValue: '1',
    helpMessage: ['可见/可访问(授权后可见/可访问)', '可编辑(未授权时禁用)'],
    componentProps: {
      options: [
        { label: '可见/可访问', value: '1' },
        { label: '可编辑', value: '2' },
      ],
    },
    ifShow: ({ values }) => isButton(values.menuType),
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '有效', value: '1' },
        { label: '无效', value: '0' },
      ],
    },
    ifShow: ({ values }) => isButton(values.menuType),
  },
  {
    field: 'icon',
    label: '菜单图标',
    component: 'IconPicker',
    ifShow: ({ values }) => !isButton(values.menuType),
    componentProps: {
      allowClear: true
    },
  },
  {
    field: 'sortNo',
    label: '排序',
    component: 'InputNumber',
    defaultValue: 1,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'route',
    label: '是否路由菜单',
    component: 'Switch',
    defaultValue: true,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
    helpMessage: [
      '1. 设为“是”（默认，开启路由）：在左侧菜单栏点击该菜单时，页面会触发路由跳转并加载渲染对应的前端 View 组件。',
      '2. 设为“否”（关闭路由）：系统仅将其作为分类目录或权限节点使用，不注册前端路由。点击该菜单不会触发页面跳转（常用于仅展开子菜单的父级目录、独立按钮权限点或组织节点）。',
    ],
    helpComponentProps: MENU_HELP_PROPS,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'hidden',
    label: '隐藏路由',
    component: 'Switch',
    defaultValue: 0,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
    helpMessage: [
      '1. 设为“是”（开启隐藏）：该菜单不会在左侧侧边栏菜单树中出现，但路由映射依然有效（可通过页面内部按钮跳转、URL直接访问或隐藏路由传参）。',
      '2. 设为“否”（默认，显示菜单）：菜单正常在左侧侧边栏中按层级展现。',
    ],
    helpComponentProps: MENU_HELP_PROPS,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'hideTab',
    label: '隐藏Tab',
    component: 'Switch',
    defaultValue: 0,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
    helpMessage: [
      '1. 设为“是”（开启隐藏Tab）：打开该页面时，页面正常渲染展示，但顶部多 Tab 栏中不会生成对应的页签卡片（常用于独立详情页、大屏可视化或不希望留存 Tab 的页面）。',
      '2. 设为“否”（默认，显示Tab）：打开该页面时，正常在顶部页签栏生成并切换对应的 Tab 标签。',
    ],
    helpComponentProps: MENU_HELP_PROPS,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'keepAlive',
    label: '是否缓存路由',
    component: 'Switch',
    defaultValue: false,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
    helpMessage: [
      '1. 设为“是”（开启缓存）：切换到其它 Tab 页再切回时，保持当前操作状态（如已选数据、查询条件），不重新刷网路请求。',
      '2. 设为“否”（默认，关闭缓存）：每次切回该标签页时，组件都会被重新销毁并重新初始化挂载。',
      '⚠️ 生效前提：前端 .vue 组件代码中的 name 属性（如 <script setup name="...">）必须与 Vue Router 路由名称完全一致。',
    ],
    helpComponentProps: MENU_HELP_PROPS,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'alwaysShow',
    label: '聚合路由',
    component: 'Switch',
    defaultValue: false,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
    helpMessage: [
      '1. 设为“是”（强制展示父级）：即使该父级菜单下只有 1 个子菜单，侧边栏也依然保留父级菜单目录节点（展开/折叠二层结构）。',
      '2. 设为“否”（默认，自动聚合）：若父菜单下只有 1 个子菜单，系统会自动合并层级，直接将该子菜单提至一级菜单位置展示。',
    ],
    helpComponentProps: MENU_HELP_PROPS,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
  {
    field: 'internalOrExternal',
    label: '打开方式',
    component: 'Switch',
    defaultValue: false,
    componentProps: {
      checkedChildren: '外部',
      unCheckedChildren: '内部',
    },
    helpMessage: [
      '1. 设为“外部”：点击菜单时，会在浏览器中新建一个独立页面标签（window.open）打开外部 URL。',
      '2. 设为“内部”（默认）：点击菜单时，在当前后台系统内部的主框架区域以嵌入式 Iframe 的形式打开该页面。',
    ],
    helpComponentProps: MENU_HELP_PROPS,
    ifShow: ({ values }) => !isButton(values.menuType),
  },
];

export const dataRuleColumns: BasicColumn[] = [
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    width: 150,
  },
  {
    title: '规则字段',
    dataIndex: 'ruleColumn',
    width: 100,
  },
  {
    title: '规则值',
    dataIndex: 'ruleValue',
    width: 100,
  },
];

export const dataRuleSearchFormSchema: FormSchema[] = [
  {
    field: 'ruleName',
    label: '规则名称',
    component: 'Input',
    // colProps: { span: 6 },
  },
  {
    field: 'ruleValue',
    label: '规则值',
    component: 'Input',
    // colProps: { span: 6 },
  },
];

export const dataRuleFormSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'ruleName',
    label: '规则名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'ruleColumn',
    label: '规则字段',
    component: 'Input',
    ifShow: ({ values }) => {
      const ruleConditions = Array.isArray(values.ruleConditions) ? values.ruleConditions[0] : values.ruleConditions;
      return ruleConditions !== 'USE_SQL_RULES';
    },
  },
  {
    field: 'ruleConditions',
    label: '条件规则',
    required: true,
    component: 'ApiSelect',
    componentProps: {
      api: ajaxGetDictItems,
      params: { code: 'rule_conditions' },
      labelField: 'text',
      valueField: 'value',
      getPopupContainer: (node) => document.body,
    },
  },
  // update-begin--author:liaozhiyang---date:20240724---for：【TV360X-1864】添加系统变量
  {
    field: 'ruleValue',
    component: 'JInputSelect',
    label: '规则值',
    required: true,
    componentProps: {
      selectPlaceholder: '可选择系统变量',
      inputPlaceholder: '请输入',
      getPopupContainer: () => document.body,
      selectWidth: '200px',
      options: [
        {
          label: '登录用户账号',
          value: '#{sys_user_code}',
        },
        {
          label: '登录用户名称',
          value: '#{sys_user_name}',
        },
        {
          label: '当前日期',
          value: '#{sys_date}',
        },
        {
          label: '当前时间',
          value: '#{sys_time}',
        },
        {
          label: '登录用户部门',
          value: '#{sys_org_code}',
        },
        {
          label: '用户拥有部门',
          value: '#{sys_multi_org_code}',
        },
        {
          label: '登录用户租户',
          value: '#{tenant_id}',
        },
      ],
    },
  },
  // update-end--author:liaozhiyang---date:20240724---for：【TV360X-1864】添加系统变量
  {
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '无效', value: '0' },
        { label: '有效', value: '1' },
      ],
    },
  },
];
