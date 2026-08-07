/**
 * 目前实现了异步加载的组件清单 ：
 * JAreaLinkage
 * JEditor
 * JMarkdownEditor
 * JCodeEditor
 * JEasyCron
 */
import type { Component } from 'vue';
import type { ComponentType } from './types/index';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
/**
 * Component list, register here to setting it in the form
 */
import {
  Input,
  Select,
  Radio,
  Checkbox,
  AutoComplete,
  Cascader,
  DatePicker,
  InputNumber,
  Switch,
  TimePicker,
  TreeSelect,
  Slider,
  Rate,
  Divider,
} from 'ant-design-vue';
import ApiRadioGroup from './components/ApiRadioGroup.vue';
import RadioButtonGroup from './components/RadioButtonGroup.vue';
import ApiSelect from './components/ApiSelect.vue';
import ApiTreeSelect from './components/ApiTreeSelect.vue';
import { BasicUpload } from '/@/components/Upload';
import { StrengthMeter } from '/@/components/StrengthMeter';
import { IconPicker } from '/@/components/Icon';
import { CountdownInput } from '/@/components/CountDown';
//自定义组件
import JDictSelectTag from './jeecg/components/JDictSelectTag.vue';
import JAreaSelect from './jeecg/components/JAreaSelect.vue';
import JSelectInput from './jeecg/components/JSelectInput.vue';
import JCategorySelect from './jeecg/components/JCategorySelect.vue';
import JSelectMultiple from './jeecg/components/JSelectMultiple.vue';
import JSwitch from './jeecg/components/JSwitch.vue';
import JTreeDict from './jeecg/components/JTreeDict.vue';
import JInputPop from './jeecg/components/JInputPop.vue';
import JCheckbox from './jeecg/components/JCheckbox.vue';
import JInput from './jeecg/components/JInput.vue';
import JTreeSelect from './jeecg/components/JTreeSelect.vue';
import JEllipsis from './jeecg/components/JEllipsis.vue';
import JSearchSelect from './jeecg/components/JSearchSelect.vue';
import JAddInput from './jeecg/components/JAddInput.vue';
import { Time } from '/@/components/Time';
import JRangeNumber from './jeecg/components/JRangeNumber.vue';
import JRangeDate from './jeecg/components/JRangeDate.vue';
import JRangeTime from './jeecg/components/JRangeTime.vue';
import JInputSelect from './jeecg/components/JInputSelect.vue';
import {DatePickerInFilter, CascaderPcaInFilter} from "@/components/InFilter";

const componentMap = new Map<ComponentType, Component>();

componentMap.set('Time', Time);
componentMap.set('Input', Input);
componentMap.set('InputGroup', Input.Group);
componentMap.set('InputPassword', Input.Password);
componentMap.set('InputSearch', Input.Search);
componentMap.set('InputTextArea', Input.TextArea);
componentMap.set('InputNumber', InputNumber);
componentMap.set('AutoComplete', AutoComplete);

componentMap.set('Select', Select);
componentMap.set('ApiSelect', ApiSelect);
componentMap.set('TreeSelect', TreeSelect);
componentMap.set('ApiTreeSelect', ApiTreeSelect);
componentMap.set('ApiRadioGroup', ApiRadioGroup);
componentMap.set('Switch', Switch);
componentMap.set('RadioButtonGroup', RadioButtonGroup);
componentMap.set('RadioGroup', Radio.Group);
componentMap.set('Checkbox', Checkbox);
componentMap.set('CheckboxGroup', Checkbox.Group);
componentMap.set('Cascader', Cascader);
componentMap.set('Slider', Slider);
componentMap.set('Rate', Rate);

componentMap.set('DatePicker', DatePicker);
componentMap.set('MonthPicker', DatePicker.MonthPicker);
componentMap.set('RangePicker', DatePicker.RangePicker);
componentMap.set('WeekPicker', DatePicker.WeekPicker);
componentMap.set('TimePicker', TimePicker);
componentMap.set('DatePickerInFilter', DatePickerInFilter);
componentMap.set('StrengthMeter', StrengthMeter);
componentMap.set('IconPicker', IconPicker);
componentMap.set('InputCountDown', CountdownInput);

componentMap.set('Upload', BasicUpload);
componentMap.set('Divider', Divider);

//注册自定义组件

componentMap.set(
  'JAreaLinkage',
  createAsyncComponent(() => import('./jeecg/components/JAreaLinkage.vue'))
);
componentMap.set(
  'JSelectPosition',
  createAsyncComponent(() => import('./jeecg/components/JSelectPosition.vue'))
);
componentMap.set(
  'JSelectUser',
  createAsyncComponent(() => import('./jeecg/components/JSelectUser.vue'))
);
componentMap.set(
  'JSelectRole',
  createAsyncComponent(() => import('./jeecg/components/JSelectRole.vue'))
);
componentMap.set(
  'JImageUpload',
  createAsyncComponent(() => import('./jeecg/components/JImageUpload.vue'))
);
componentMap.set('JDictSelectTag', JDictSelectTag);
componentMap.set(
  'JSelectDept',
  createAsyncComponent(() => import('./jeecg/components/JSelectDept.vue'))
);
componentMap.set('JAreaSelect', JAreaSelect);
componentMap.set(
  'JLinkTableCard',
  createAsyncComponent(() => import('./jeecg/components/JLinkTableCard/JLinkTableCard.vue'))
);
componentMap.set(
  'JEditor',
  createAsyncComponent(() => import('./jeecg/components/JEditor.vue'))
);
componentMap.set(
  'JMarkdownEditor',
  createAsyncComponent(() => import('./jeecg/components/JMarkdownEditor.vue'))
);
componentMap.set('JSelectInput', JSelectInput);
componentMap.set(
  'JCodeEditor',
  createAsyncComponent(() => import('./jeecg/components/JCodeEditor.vue'))
);
componentMap.set('JCategorySelect', JCategorySelect);
componentMap.set('JSelectMultiple', JSelectMultiple);
componentMap.set(
  'JPopup',
  createAsyncComponent(() => import('./jeecg/components/JPopup.vue'))
);
componentMap.set(
  'JPopupDict',
  createAsyncComponent(() => import('./jeecg/components/JPopupDict.vue'))
);
componentMap.set('JSwitch', JSwitch);
componentMap.set('JTreeDict', JTreeDict);
componentMap.set('JInputPop', JInputPop);
componentMap.set(
  'JEasyCron',
  createAsyncComponent(() => import('./jeecg/components/JEasyCron/EasyCronInput.vue'))
);
componentMap.set('JCheckbox', JCheckbox);
componentMap.set('JInput', JInput);
componentMap.set('JTreeSelect', JTreeSelect);
componentMap.set('JEllipsis', JEllipsis);
componentMap.set(
  'JSelectUserByDept',
  createAsyncComponent(() => import('./jeecg/components/JSelectUserByDept.vue'))
);
componentMap.set(
  'JSelectUserByDepartment',
  createAsyncComponent(() => import('./jeecg/components/JSelectUserByDepartment.vue'))
);
componentMap.set(
  'JUpload',
  createAsyncComponent(() => import('./jeecg/components/JUpload/JUpload.vue'))
);
componentMap.set('JSearchSelect', JSearchSelect);
componentMap.set('JAddInput', JAddInput);
componentMap.set('JRangeNumber', JRangeNumber);
componentMap.set('CascaderPcaInFilter', CascaderPcaInFilter);
componentMap.set(
  'UserSelect',
  createAsyncComponent(() => import('./jeecg/components/userSelect/index.vue'))
);
componentMap.set('RangeDate', JRangeDate);
componentMap.set('RangeTime', JRangeTime);
componentMap.set(
  'RoleSelect',
  createAsyncComponent(() => import('./jeecg/components/roleSelect/RoleSelectInput.vue'))
);
componentMap.set('JInputSelect', JInputSelect);
componentMap.set(
  'JSelectDepartPost',
  createAsyncComponent(() => import('./jeecg/components/JSelectDepartPost.vue'))
);
componentMap.set(
  'JSelectUserByDeptPost',
  createAsyncComponent(() => import('./jeecg/components/JSelectUserByDeptPost.vue'))
);



export function add(compName: ComponentType, component: Component) {
  componentMap.set(compName, component);
}

export function del(compName: ComponentType) {
  componentMap.delete(compName);
}

export { componentMap };
