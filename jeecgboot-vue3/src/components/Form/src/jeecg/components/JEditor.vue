<template>
  <!-- update-begin--author:dcs---date:20260724---for: 详情态直接渲染HTML，与Online DetailForm保持一致，避免禁用的编辑器带来的工具栏和边框 -->
  <div v-if="props.disabled" class="jeditor-detail-view" v-html="props.value || ''" />
  <!-- update-end--author:dcs---date:20260724---for: 详情态直接渲染HTML，与Online DetailForm保持一致 -->
  <Tinymce v-else v-bind="bindProps" @change="onChange" />
</template>

<script lang="ts">
  import { computed, defineComponent, nextTick } from 'vue';

  import { Tinymce } from '/@/components/Tinymce';
  import { propTypes } from '/@/utils/propTypes';
  import { Form } from 'ant-design-vue';

  export default defineComponent({
    name: 'JEditor',
    // 不将 attrs 的属性绑定到 html 标签上
    inheritAttrs: false,
    components: { Tinymce },
    props: {
      value: propTypes.string.def(''),
      disabled: propTypes.bool.def(false),
      //是否聚焦
      autoFocus: propTypes.bool.def(true),
    },
    emits: ['change', 'update:value'],
    setup(props, { emit, attrs }) {
      // 合并 props 和 attrs（仅编辑态使用）
      const bindProps = computed(() => Object.assign({}, props, attrs));
      const formItemContext = Form.useInjectFormItemContext();
      // value change 事件
      function onChange(value) {
        emit('change', value);
        emit('update:value', value);
        // update-begin--author:liaozhiyang---date:20240429---for：【QQYUN-9110】组件有值校验没消失
        nextTick(() => {
          formItemContext?.onFieldChange();
        });
        // update-end--author:liaozhiyang---date:20240429---for：【QQYUN-9110】组件有值校验没消失
      }

      return {
        props,
        bindProps,
        onChange,
      };
    },
  });
</script>

<style lang="less" scoped>
  // update-begin--author:dcs---date:20260724---for: 详情态富文本只读视图样式
  .jeditor-detail-view {
    padding: 4px 0;
    min-height: 32px;
    line-height: 1.6;
    word-break: break-all;
    // 还原富文本内常见 HTML 标签的默认样式（浏览器 reset 后会丢失）
    :deep(p) { margin: 0 0 4px; }
    :deep(ul), :deep(ol) { padding-left: 20px; margin: 4px 0; }
    :deep(img) { max-width: 100%; }
    :deep(strong) { font-weight: bold; }
    :deep(em) { font-style: italic; }
  }
  // update-end--author:dcs---date:20260724---for: 详情态富文本只读视图样式
</style>
