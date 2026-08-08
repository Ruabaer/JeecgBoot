<template>
  <BasicModal @register="registerModal" :title="title" :width="600" v-bind="$attrs" @ok="onSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { formSchemas } from './template.data';
  import { saveOrUpdate } from './template.api';

  // 声明 emits
  const emit = defineEmits(['success', 'register']);
  const title = ref<string>('');
  const isUpdate = ref<boolean>(false);
  // 缓存编辑记录的id，因为validate()不会返回show:false的隐藏字段
  const recordId = ref<string>('');
  // 注册 form
  //update-begin---author:wangshuai ---date:20221123  for：[VUEN-2807]消息模板加一个查看功能------------
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, setProps }] = useForm({
  //update-end---author:wangshuai ---date:20221123  for：[VUEN-2807]消息模板加一个查看功能--------------z
    schemas: formSchemas,
    showActionButtonGroup: false,
    baseRowStyle: {
      marginTop: '10px',
    },
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 17,
    },
  });
  // 注册 modal
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
    isUpdate.value = unref(data.isUpdate);
    title.value = unref(data.title);
    // 缓存记录id
    recordId.value = data.record?.id || '';
    await resetFields();
    await setFieldsValue({ ...data.record });
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter })
  });

  //表单提交事件
  async function onSubmit() {
    try {
      const values = await validate();
      // validate()不返回show:false的字段，手动补回id
      if (unref(isUpdate) && recordId.value) {
        values.id = recordId.value;
      }
      setModalProps({ confirmLoading: true });
      // 提交表单
      await saveOrUpdate(values, isUpdate);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

