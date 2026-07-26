<template>
  <div :class="[prefixCls, 'inline-flex items-center']" style="height: 32px; line-height: 1;">
    <a-select
      v-if="query"
      v-model:value="state"
      :options="selectOptions"
      :disabled="disabled"
      style="width: 100%"
      v-bind="attrs"
      @change="onSelectChange"
    />
    <template v-else>
      <a-switch v-model:checked="checked" :disabled="disabled" v-bind="attrs" @change="onSwitchChange" />
      <span
        v-if="rightLabel || showRightLabel"
        class="ml-2 select-none text-gray-600 inline-flex items-center leading-none"
        :class="{ 'cursor-pointer hover:text-primary': helpModalTitle || helpModalContent }"
        @click="handleHelpClick"
      >
        {{ rightLabel || (checked ? labelOptions[0] : labelOptions[1]) }}
      </span>

      <!-- 问号图标：当配置了 helpModalTitle/helpModalContent 时显示橙色问号，点击调起说明对话框 -->
      <Icon
        v-if="helpModalTitle || helpModalContent"
        icon="ant-design:question-circle-outlined"
        class="ml-1.5 cursor-pointer text-base inline-flex items-center"
        style="color: #fa8c16;"
        title="点击查看规则说明"
        @click.stop="handleHelpClick"
      />
      <BasicHelp
        v-else-if="helpMessage"
        class="ml-1 inline-flex items-center"
        :text="helpMessage"
        v-bind="helpComponentProps"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { BasicHelp } from '/@/components/Basic';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { prefixCls } = useDesign('j-switch');
  const props = defineProps({
    // v-model:value
    value: propTypes.oneOfType([propTypes.string, propTypes.number, propTypes.bool]),
    // 取值 options
    options: propTypes.array.def(() => ['Y', 'N']),
    // 文本 options
    labelOptions: propTypes.array.def(() => ['是', '否']),
    // 是否使用下拉
    query: propTypes.bool.def(false),
    // 是否禁用
    disabled: propTypes.bool.def(false),
    // 右侧静态文本 Label
    rightLabel: propTypes.string.def(''),
    // 是否在右侧显示动态状态文本（如 “是/否”）
    showRightLabel: propTypes.bool.def(false),
    // 弹窗说明标题
    helpModalTitle: propTypes.string.def(''),
    // 弹窗说明内容
    helpModalContent: propTypes.any.def(null),
    // 右侧绑定帮助提示内容
    helpMessage: propTypes.oneOfType([propTypes.string, propTypes.array]).def(''),
    // 帮助提示组件的附加属性
    helpComponentProps: propTypes.object.def(() => ({ placement: 'top', maxWidth: '480px' })),
  });
  const attrs = useAttrs();
  const emit = defineEmits(['change', 'update:value']);

  const checked = ref<boolean>(false);
  const [state] = useRuleFormItem(props, 'value', 'change');
  watch(
    () => props.value,
    (val) => {
      if (!props.query) {
        // update-begin--author:liaozhiyang---date:20231226---for：【QQYUN-7473】options使用[0,1]，导致开关无法切换
        if (!val && !props.options.includes(val)) {
          checked.value = false;
          emitValue(props.options[1]);
        } else {
          checked.value = props.options[0] == val;
        }
        // update-end--author:liaozhiyang---date:20231226---for：【QQYUN-7473】options使用[0,1]，导致开关无法切换
      }
    },
    { immediate: true }
  );

  const selectOptions = computed(() => {
    let options: any[] = [];
    options.push({ value: props.options[0], label: props.labelOptions[0] });
    options.push({ value: props.options[1], label: props.labelOptions[1] });
    return options;
  });

  function onSwitchChange(checked) {
    let flag = checked === false ? props.options[1] : props.options[0];
    emitValue(flag);
  }

  function onSelectChange(value) {
    emitValue(value);
  }

  function emitValue(value) {
    emit('change', value);
    emit('update:value', value);
  }

  function handleHelpClick() {
    if (props.helpModalTitle || props.helpModalContent) {
      const { createInfoModal } = useMessage();
      createInfoModal({
        title: props.helpModalTitle || '作用说明',
        width: 520,
        content: () =>
          typeof props.helpModalContent === 'function'
            ? props.helpModalContent()
            : props.helpModalContent || props.helpMessage,
      });
    }
  }
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-j-switch';

  .@{prefix-cls} {
    display: inline-flex;
    align-items: center;
    line-height: 1;

    .ant-switch {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
</style>
