<template>
  <Tooltip placement="top" v-bind="getBindProps" >
    <template #title>
      <span>{{ t('component.table.settingColumn') }}</span>
    </template>
    <Popover
      v-model:open="popoverVisible"
      placement="bottomLeft"
      trigger="click"
      @open-change="handleVisibleChange"
      :overlayClassName="`${prefixCls}__cloumn-list`"
      :getPopupContainer="getPopupContainer"
    >
      <template #title>
        <div :class="`${prefixCls}__popover-title`">
          <Checkbox :indeterminate="indeterminate" v-model:checked="checkAll" @change="onCheckAllChange">
            {{ t('component.table.settingColumnShow') }}
          </Checkbox>

          <Checkbox v-model:checked="checkIndex" @change="handleIndexCheckChange">
            {{ t('component.table.settingIndexColumnShow') }}
          </Checkbox>

          <!--                    <Checkbox-->
          <!--                            v-model:checked="checkSelect"-->
          <!--                            @change="handleSelectCheckChange"-->
          <!--                            :disabled="!defaultRowSelection"-->
          <!--                    >-->
          <!--                        {{ t('component.table.settingSelectColumnShow') }}-->
          <!--                    </Checkbox>-->
        </div>
      </template>

      <template #content>
        <ScrollContainer>
          <CheckboxGroup v-model:value="checkedList" @change="onChange" ref="columnListRef">
            <template v-for="item in plainOptions" :key="item.value">
              <div :class="`${prefixCls}__check-item`" :data-value="item.value" v-if="!('ifShow' in item && !item.ifShow)">
                <DragOutlined class="table-column-drag-icon" />
                <Checkbox :value="item.value">
                  {{ item.label }}
                </Checkbox>

                <Tooltip placement="bottomLeft" :mouseLeaveDelay="0.4" :getPopupContainer="getPopupContainer">
                  <template #title>
                    {{ t('component.table.settingFixedLeft') }}
                  </template>
                  <Icon
                    icon="line-md:arrow-align-left"
                    :class="[
                      `${prefixCls}__fixed-left`,
                      {
                        active: item.fixed === 'left',
                        disabled: !checkedList.includes(item.value),
                      },
                    ]"
                    @click="handleColumnFixed(item, 'left')"
                  />
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip placement="bottomLeft" :mouseLeaveDelay="0.4" :getPopupContainer="getPopupContainer">
                  <template #title>
                    {{ t('component.table.settingFixedRight') }}
                  </template>
                  <Icon
                    icon="line-md:arrow-align-left"
                    :class="[
                      `${prefixCls}__fixed-right`,
                      {
                        active: item.fixed === 'right',
                        disabled: !checkedList.includes(item.value),
                      },
                    ]"
                    @click="handleColumnFixed(item, 'right')"
                  />
                </Tooltip>
              </div>
            </template>
          </CheckboxGroup>
        </ScrollContainer>
        <div :class="`${prefixCls}__popover-footer`">
          <a-button size="small" @click="reset">
            {{ t('common.resetText') }}
          </a-button>
          <a-button size="small" type="primary" @click="saveSetting"> 保存 </a-button>
        </div>
      </template>
      <SettingOutlined />
    </Popover>
  </Tooltip>
</template>
<script lang="ts">
  import type { BasicColumn, ColumnChangeParam } from '../../types/table';
  import { defineComponent, ref, reactive, toRefs, watchEffect, nextTick, unref, computed, watch } from 'vue';
  import { Tooltip, Popover, Checkbox, Divider } from 'ant-design-vue';
  import type { CheckboxChangeEvent } from 'ant-design-vue/lib/checkbox/interface';
  import { SettingOutlined, DragOutlined } from '@ant-design/icons-vue';
  import { Icon } from '/@/components/Icon';
  import { ScrollContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useTableContext } from '../../hooks/useTableContext';
  import { useColumnsCache } from '../../hooks/useColumnsCache';
  import { useDesign } from '/@/hooks/web/useDesign';
  // import { useSortable } from '/@/hooks/web/useSortable';
  import { isFunction, isNullAndUnDef } from '/@/utils/is';
  import { getPopupContainer as getParentContainer } from '/@/utils';
  import { cloneDeep, omit, isEqual } from 'lodash-es';
  import Sortablejs from 'sortablejs';
  import type Sortable from 'sortablejs';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';

  interface State {
    checkAll: boolean;
    isInit?: boolean;
    checkedList: string[];
    defaultCheckList: string[];
  }

  interface Options {
    label: string;
    value: string;
    fixed?: boolean | 'left' | 'right';
  }

  export default defineComponent({
    name: 'ColumnSetting',
    props: {
      isMobile: Boolean,
    },
    components: {
      SettingOutlined,
      Popover,
      Tooltip,
      Checkbox,
      CheckboxGroup: Checkbox.Group,
      DragOutlined,
      ScrollContainer,
      Divider,
      Icon,
    },
    emits: ['columns-change'],

    setup(props, { emit, attrs }) {
      const { t } = useI18n();
      const table = useTableContext();
      const popoverVisible = ref(false);
      // update-begin--author:sunjianlei---date:20221101---for: 修复第一次进入时列表配置不能拖拽
      // nextTick(() => popoverVisible.value = false);
      // update-end--author:sunjianlei---date:20221101---for: 修复第一次进入时列表配置不能拖拽
      const defaultRowSelection = omit(table.getRowSelection(), 'selectedRowKeys');
      let inited = false;

      const cachePlainOptions = ref<Options[]>([]);
      const plainOptions = ref<Options[] | any>([]);

      const plainSortOptions = ref<Options[]>([]);

      const columnListRef = ref<ComponentRef>(null);

      const restAfterOptions = {
        value: null,
      };

      const state = reactive<State>({
        checkAll: true,
        checkedList: [],
        defaultCheckList: [],
      });

      const checkIndex = ref(false);
      const checkSelect = ref(false);

      const { prefixCls } = useDesign('basic-column-setting');

      const getValues = computed(() => {
        return unref(table?.getBindValues) || {};
      });

      const getBindProps = computed(() => {
        let obj = {};
        if (props.isMobile) {
          obj['open'] = false;
        }
        return obj;
      });

      let sortable: Sortable;
      const sortableOrder = ref<string[]>();
      const localeStore = useLocaleStoreWithOut();
      // 列表字段配置缓存
      const { saveSetting, resetSetting, getCache } = useColumnsCache(
        {
          state,
          popoverVisible,
          plainOptions,
          plainSortOptions,
          sortableOrder,
          checkIndex,
          restAfterOptions,
        },
        setColumns,
        handleColumnFixed
      );

      watchEffect(() => {
        setTimeout(() => {
          if (!state.isInit) {
            init();
          }
        }, 0);
      });

      //update-begin--Author:lipen -- Date:20260703 ----for：【修复】监听表格列的动态变更，同步更新列设置列表的顺序及选项，防止切换路由/表格时出现不同步-----
      watch(
        () => table.getColumns(),
        (newVal) => {
          if (!newVal || !newVal.length) return;
          const plainKeys = plainOptions.value.map((item) => item.value);
          const newKeys = newVal
            .filter((item) => !item.flag)
            .map((item) => (item.dataIndex || item.title) as string);
          

          if (!isEqual(plainKeys, newKeys)) {
            plainOptions.value = [];
            plainSortOptions.value = [];
            cachePlainOptions.value = [];
            state.isInit = false;
            inited = false;
            init();
          }
        },
        { deep: true }
      );
      //update-end--Author:lipen -- Date:20260703 ----for：【修复】监听表格列的动态变更，同步更新列设置列表的顺序及选项，防止切换路由/表格时出现不同步-----

      watchEffect(() => {
        const values = unref(getValues);
        checkIndex.value = !!values.showIndexColumn;
        checkSelect.value = !!values.rowSelection;
      });
      // update-begin--author:liaozhiyang---date:20240724---for：【issues/6908】多语言无刷新切换时，BasicColumn和FormSchema里面的值不能正常切换
      watch(localeStore, () => {
        const columns = getColumns();
        plainOptions.value = columns;
        plainSortOptions.value = columns;
        cachePlainOptions.value = columns;
      });
      // update-end--author:liaozhiyang---date:20240724---for：【issues/6908】多语言无刷新切换时，BasicColumn和FormSchema里面的值不能正常切换

      function getColumns() {
        const ret: Options[] = [];
        // update-begin--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
        let t = table.getColumns({ ignoreIndex: true, ignoreAction: true });
        if (!t.length) {
          t = table.getCacheColumns();
        }
        // update-end--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
        t.forEach((item) => {
          ret.push({
            label: (item.title as string) || (item.customTitle as string),
            value: (item.dataIndex || item.title) as string,
            ...item,
          });
        });
        return ret;
      }

      async function init() {
        const columns = getColumns();

        const checkList = table
          .getColumns({ ignoreAction: true, ignoreIndex: true })
          .map((item) => {
            if (item.defaultHidden) {
              return '';
            }
            return item.dataIndex || item.title;
          })
          .filter(Boolean) as string[];
        // update-begin--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
        const { sortedList = [] } = getCache() || {};
        await nextTick();
        // update-end--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
        if (!plainOptions.value.length) {
          // update-begin--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
          let tmp = columns;
          if (sortedList?.length) {
            tmp = columns.sort((prev, next) => {
              return sortedList.indexOf(prev.value) - sortedList.indexOf(next.value);
            });
          }
          // update-end--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
          plainOptions.value = tmp;
          plainSortOptions.value = tmp;
          cachePlainOptions.value = tmp;
          state.defaultCheckList = checkList;
        } else {
          // const fixedColumns = columns.filter((item) =>
          //   Reflect.has(item, 'fixed')
          // ) as BasicColumn[];

          unref(plainOptions).forEach((item: BasicColumn) => {
            const findItem = columns.find((col: BasicColumn) => col.dataIndex === item.dataIndex);
            if (findItem) {
              item.fixed = findItem.fixed;
            }
          });
          // update-begin--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
          if (sortedList?.length) {
            plainOptions.value.sort((prev, next) => {
              return sortedList.indexOf(prev.value) - sortedList.indexOf(next.value);
            });
          }
          // update-end--author:liaozhiyang---date:20250403---for：【issues/7996】表格列组件取消所有或者只勾选中间，显示非预期
        }
        state.isInit = true;
        state.checkedList = checkList;
        // update-begin--author:liaozhiyang---date:20240612---for：【TV360X-105】列展示设置问题[列展示如果存在未勾选的列，保存并刷新后，列展示复选框样式会错乱]
        state.checkAll = columns.length === checkList.length;
        // update-end--author:liaozhiyang---date:20240612---for：【TV360X-105】列展示设置问题[列展示如果存在未勾选的列，保存并刷新后，列展示复选框样式会错乱]
      }

      // checkAll change
      function onCheckAllChange(e: CheckboxChangeEvent) {
        const checkList = plainOptions.value.map((item) => item.value);
        if (e.target.checked) {
          state.checkedList = checkList;
          setColumns(checkList);
        } else {
          state.checkedList = [];
          setColumns([]);
        }
      }

      const indeterminate = computed(() => {
        const len = plainOptions.value.length;
        let checkedLen = state.checkedList.length;
        // update-begin--author:liaozhiyang---date:20240612---for：【TV360X-105】列展示设置问题[列展示复选框不应该判断序号列复选框的状态]
        // unref(checkIndex) && checkedLen--;
        // update-end--author:liaozhiyang---date:20240612---for：【TV360X-105】列展示设置问题[列展示复选框不应该判断序号列复选框的状态]
        return checkedLen > 0 && checkedLen < len;
      });

      // Trigger when check/uncheck a column
      function onChange(checkedList: string[]) {
        const len = plainSortOptions.value.length;
        state.checkAll = checkedList.length === len;
        const sortList = unref(plainSortOptions).map((item) => item.value);
        checkedList.sort((prev, next) => {
          return sortList.indexOf(prev) - sortList.indexOf(next);
        });
        const fullCols = unref(plainSortOptions).map(col => {
          col.defaultHidden = !checkedList.includes(col.value);
          return col;
        });
        setColumns(fullCols);
      }

      function getOriginalSchemaColumns() {
        const ret: Options[] = [];
        table.getCacheColumns().forEach((item) => {
          if (item.flag) return;
          const val = item.dataIndex || (typeof item.title === 'string' ? item.title : '') || item.key || item.customTitle;
          ret.push({
            label: (item.title as string) || (item.customTitle as string),
            value: (val || '') as string,
            ...item,
          });
        });
        return ret;
      }

      // reset columns
      function reset() {
        //update-begin--Author:lipen -- Date:20260703 ----for：【修复】重置时直接使用缓存的原始 schema 列进行重排与勾选过滤，解决“更新时间”等列位置重置后不同步的问题-----
        setColumns(table.getCacheColumns());
        setTimeout(() => {
          state.checkedList = table
            .getCacheColumns()
            .map((item) => {
              if (item.defaultHidden) {
                return '';
              }
              return item.dataIndex || item.title;
            })
            .filter(Boolean) as string[];
          
          const originalOptions = getOriginalSchemaColumns();
          plainOptions.value = originalOptions;
          plainSortOptions.value = originalOptions;
          
          state.checkAll = state.checkedList.length === plainOptions.value.length;
          resetSetting();
        }, 100);
        //update-end--Author:lipen -- Date:20260703 ----for：【修复】重置时直接使用缓存的原始 schema 列进行重排与勾选过滤，解决“更新时间”等列位置重置后不同步的问题-----
      }

      // Open the pop-up window for drag and drop initialization
      function handleVisibleChange() {
        if (inited) return;
        // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-254】列设置闪现及苹果浏览器弹窗过长
        setTimeout(() => {
          // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-254】列设置闪现及苹果浏览器弹窗过长
          const columnListEl = unref(columnListRef);
          if (!columnListEl) return;
          const el = columnListEl.$el as any;
          if (!el) return;
          // Drag and drop sort
          sortable = Sortablejs.create(unref(el), {
            animation: 500,
            delay: 400,
            delayOnTouchOnly: true,
            handle: '.table-column-drag-icon ',
            onEnd: (evt) => {
              const { oldIndex, newIndex } = evt;
              if (isNullAndUnDef(oldIndex) || isNullAndUnDef(newIndex) || oldIndex === newIndex) {
                return;
              }
              const parent = evt.from;
              if (!parent) return;

              // 1. 从真实的 DOM 树顺序中提取当前可见列的最新拖拽排列值
              const draggedValues = Array.from(parent.children)
                .map((el) => el.getAttribute('data-value'))
                .filter(Boolean) as string[];

              // 物理恢复 DOM 结构，让 Vue 接管更新渲染，防止 Vue 虚拟 DOM 冲突报错
              const children = Array.from(parent.children);
              if (oldIndex < newIndex) {
                parent.insertBefore(evt.item, children[oldIndex]);
              } else {
                parent.insertBefore(evt.item, children[oldIndex].nextSibling);
              }

              // 2. 根据拖拽值重构 columns
              const plainSortVal = plainSortOptions.value;
              const newVisibleCols = draggedValues
                .map((val) => plainSortVal.find((item) => item.value === val))
                .filter(Boolean) as BasicColumn[];

              // 3. 将 ifShow 隐藏列（未渲染在 DOM 中的列）插回其原始相对位置
              const columns = [...newVisibleCols];
              const hiddenCols = plainSortVal.filter((item) => 'ifShow' in item && !item.ifShow);
              hiddenCols.forEach((col) => {
                const originalIndex = plainSortVal.findIndex((item) => item.value === col.value);
                let insertIndex = 0;
                for (let i = 0; i < originalIndex; i++) {
                  const prevVal = plainSortVal[i].value;
                  const newPrevIndex = columns.findIndex((item) => item.value === prevVal);
                  if (newPrevIndex !== -1) {
                    insertIndex = newPrevIndex + 1;
                  }
                }
                columns.splice(insertIndex, 0, col);
              });



              plainSortOptions.value = columns;
              plainOptions.value = columns;

              const fullCols = columns.map(col => {
                col.defaultHidden = !state.checkedList.includes(col.value);
                return col;
              });
              setColumns(fullCols);
            },
          });
          // 记录原始 order 序列
          if (!sortableOrder.value) {
            sortableOrder.value = sortable.toArray();
          }
          inited = true;
        }, 2000);
      }

      // Control whether the serial number column is displayed
      function handleIndexCheckChange(e: CheckboxChangeEvent) {
        table.setProps({
          showIndexColumn: e.target.checked,
        });
      }

      // Control whether the check box is displayed
      function handleSelectCheckChange(e: CheckboxChangeEvent) {
        table.setProps({
          rowSelection: e.target.checked ? defaultRowSelection : undefined,
        });
      }

      function handleColumnFixed(item: BasicColumn, fixed?: 'left' | 'right') {
        if (!state.checkedList.includes(item.dataIndex as string)) return;

        const columns = getColumns() as BasicColumn[];
        const isFixed = item.fixed === fixed ? false : fixed;
        const index = columns.findIndex((col) => col.dataIndex === item.dataIndex);
        if (index !== -1) {
          columns[index].fixed = isFixed;
        }
        item.fixed = isFixed;

        if (isFixed && !item.width) {
          item.width = 100;
        }
        table.setCacheColumnsByField?.(item.dataIndex as string, { fixed: isFixed });
        setColumns(columns);
      }

      function setColumns(columns: BasicColumn[] | string[]) {
        table.setColumns(columns);
        const data: ColumnChangeParam[] = unref(plainSortOptions).map((col) => {
          const visible = state.checkedList.includes(col.value);
          return { dataIndex: col.value, fixed: col.fixed, visible };
        });

        emit('columns-change', data);
      }

      function getPopupContainer() {
        return isFunction(attrs.getPopupContainer) ? attrs.getPopupContainer() : getParentContainer();
      }

      return {
        getBindProps,
        t,
        ...toRefs(state),
        popoverVisible,
        indeterminate,
        onCheckAllChange,
        onChange,
        plainOptions,
        reset,
        saveSetting,
        prefixCls,
        columnListRef,
        handleVisibleChange,
        checkIndex,
        checkSelect,
        handleIndexCheckChange,
        handleSelectCheckChange,
        defaultRowSelection,
        handleColumnFixed,
        getPopupContainer,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-basic-column-setting';

  .table-column-drag-icon {
    margin: 0 5px;
    cursor: move;
  }

  .@{prefix-cls} {
    &__popover-title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* 卡片底部样式 */
    &__popover-footer {
      position: relative;
      top: 7px;
      text-align: right;
      padding: 4px 0 0;
      border-top: 1px solid #f0f0f0;

      .ant-btn {
        margin-right: 6px;
      }
    }

    &__check-item {
      display: flex;
      align-items: center;
      min-width: 100%;
      padding: 4px 16px 8px 0;

      .ant-checkbox-wrapper {
        width: 100%;

        &:hover {
          color: @primary-color;
        }
      }
    }

    &__fixed-left,
    &__fixed-right {
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;

      &.active,
      &:hover {
        color: @primary-color;
      }

      &.disabled {
        color: @disabled-color;
        cursor: not-allowed;
      }
    }

    &__fixed-right {
      transform: rotate(180deg);
    }

    &__cloumn-list {
      svg {
        width: 1em !important;
        height: 1em !important;
      }

      .ant-popover-inner-content {
        // max-height: 360px;
        padding-right: 0;
        padding-left: 0;
        // overflow: auto;
      }

      .ant-checkbox-group {
        // update-begin--author:liaozhiyang---date:20240118---for：【QQYUN-7887】表格列设置宽度过长
        // width: 100%;
        min-width: 260px;
        max-width: min-content;
        // update-end--author:liaozhiyang---date:20240118---for：【QQYUN-7887】表格列设置宽度过长
        // flex-wrap: wrap;
      }

      // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-254】列设置闪现及苹果浏览器弹窗过长
      &.ant-popover,
      .ant-popover-content,
      .ant-popover-inner,
      .ant-popover-inner-content,
      .scroll-container,
      .scrollbar__wrap {
        max-width: min-content;
      }
      // update-end--author:liaozhiyang---date:20240529---for：【TV360X-254】列设置闪现及苹果浏览器弹窗过长
      .scrollbar {
        height: 220px;
      }
    }
  }
</style>
