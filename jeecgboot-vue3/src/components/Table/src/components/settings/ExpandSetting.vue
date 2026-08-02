<template>
  <Tooltip placement="top" v-bind="getBindProps">
    <template #title>
      <span>{{ isFullWidth ? '行扩展：100%屏宽 (点击切为实际宽度)' : '行扩展：实际宽度 (点击切为100%屏宽)' }}</span>
    </template>
    <TableOutlined :style="{ color: isFullWidth ? '#1890ff' : 'inherit', cursor: 'pointer' }" @click="toggleExpand" />
  </Tooltip>
</template>
<script lang="ts">
  import { computed, defineComponent, unref } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { TableOutlined } from '@ant-design/icons-vue';
  import { useTableContext } from '../../hooks/useTableContext';

  export default defineComponent({
    name: 'ExpandSetting',
    props: {
      isMobile: Boolean,
    },
    components: {
      TableOutlined,
      Tooltip,
    },
    setup(props) {
      const table = useTableContext();

      const getBindProps = computed(() => {
        let obj = {};
        if (props.isMobile) {
          obj['visible'] = false;
        }
        return obj;
      });

      const isFullWidth = computed(() => {
        return table && table.isFullWidthRef ? unref(table.isFullWidthRef) : true;
      });

      function toggleExpand() {
        if (table && table.toggleFullWidthMode) {
          table.toggleFullWidthMode();
        }
      }

      return { getBindProps, toggleExpand, isFullWidth };
    },
  });
</script>
