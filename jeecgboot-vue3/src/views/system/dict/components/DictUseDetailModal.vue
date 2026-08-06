<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="900"
    :showCancelBtn="false"
    :showOkBtn="false"
  >
    <div class="dict-use-detail-container">
      <BasicTable @register="registerTable" />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getDictUseDetails } from '../dict.api';

  const modalTitle = ref<string>('字典关联使用明细');

  const detailColumns: BasicColumn[] = [
    {
      title: '模块类型',
      dataIndex: 'type',
      width: 110,
    },
    {
      title: '模块说明',
      dataIndex: 'moduleRemark',
      width: 180,
    },
    {
      title: '业务/表说明',
      dataIndex: 'tableTxt',
      width: 160,
    },
    {
      title: '表名/实体',
      dataIndex: 'tableName',
      width: 150,
    },
    {
      title: '字段说明',
      dataIndex: 'fieldTxt',
      width: 130,
    },
    {
      title: '字段属性名',
      dataIndex: 'fieldName',
      width: 130,
    },
  ];

  const [registerTable, { setTableData, setLoading }] = useTable({
    columns: detailColumns,
    showIndexColumn: true,
    pagination: false,
    canResize: false,
    bordered: true,
    size: 'small',
  });

  const [registerModal] = useModalInner(async (data) => {
    modalTitle.value = `字典 [${data.dictName || data.dictCode}] 关联使用明细`;
    setLoading(true);
    try {
      const list = await getDictUseDetails({ dictCode: data.dictCode });
      setTableData(list || []);
    } finally {
      setLoading(false);
    }
  });
</script>

<style scoped lang="less">
  .dict-use-detail-container {
    padding: 8px 0;
  }
</style>
