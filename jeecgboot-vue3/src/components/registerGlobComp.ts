import type { App } from 'vue';
import { Icon } from './Icon';
import AIcon from '/@/components/jeecg/AIcon.vue';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

import { Button, JUploadButton } from './Button';

// 按需注册antd的组件
import {
  // Need
  Button as AntButton,
  Select,
  Alert,
  Checkbox,
  DatePicker,
  TimePicker,
  Calendar,
  Radio,
  Switch,
  Card,
  List,
  Tabs,
  Descriptions,
  Tree,
  Table,
  Divider,
  Modal,
  Drawer,
  TreeSelect,
  Dropdown,
  Tag,
  Tooltip,
  Badge,
  Popover,
  Upload,
  Transfer,
  Steps,
  PageHeader,
  Result,
  Empty,
  Avatar,
  Menu,
  Breadcrumb,
  Form,
  Input,
  Row,
  Col,
  Spin,
  Space,
  Layout,
  Collapse,
  Slider,
  InputNumber,
  Carousel,
  Popconfirm,
  Skeleton,
  Cascader,
  Rate,
  Progress
} from 'ant-design-vue';
const compList = [AntButton.Group, Icon, AIcon, JUploadButton];


export function registerGlobComp(app: App) {
  compList.forEach((comp) => {
    app.component(comp.name || comp.displayName, comp);
  });
  
  // Tinymce 富文本异步组件加载
  app.component(
    'Tinymce',
    createAsyncComponent(() => import('./Tinymce/src/Editor.vue'), { loading: true })
  );
  app.component(
    'Editor',
    createAsyncComponent(() => import('./Tinymce/src/Editor.vue'), { loading: true })
  );
  app.use(Select)
    .use(Alert)
    .use(Button)
    .use(Breadcrumb)
    .use(Checkbox)
    .use(DatePicker)
    .use(TimePicker)
    .use(Calendar)
    .use(Radio)
    .use(Switch)
    .use(Card)
    .use(List)
    .use(Descriptions)
    .use(Tree)
    .use(TreeSelect)
    .use(Table)
    .use(Divider)
    .use(Modal)
    .use(Drawer)
    .use(Dropdown)
    .use(Tag)
    .use(Tooltip)
    .use(Badge)
    .use(Popover)
    .use(Upload)
    .use(Transfer)
    .use(Steps)
    .use(PageHeader)
    .use(Result)
    .use(Empty)
    .use(Avatar)
    .use(Menu)
    .use(Tabs)
    .use(Form)
    .use(Input)
    .use(Row)
    .use(Col)
    .use(Spin)
    .use(Space)
    .use(Layout)
    .use(Collapse)
    .use(Slider)
    .use(InputNumber)
    .use(Carousel)
    .use(Popconfirm)
    .use(Skeleton)
    .use(Cascader)
    .use(Rate)
    .use(Progress);
    console.log('%c 全局组件 %c AntDesignVue 基础控件注册完成 ', 'color: #ffffff; background: #fa8c16; padding: 2px 4px; border-radius: 3px 0 0 3px; font-weight: bold;', 'color: #fa8c16; background: #fff7e6; padding: 2px 4px; border-radius: 0 3px 3px 0; border: 1px solid #ffd591;');
}
