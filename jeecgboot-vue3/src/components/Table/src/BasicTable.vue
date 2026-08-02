<template>
  <div ref="wrapRef" :class="getWrapperClass">
    <BasicForm
      :class="{ 'table-search-area-hidden': !getBindValues.formConfig?.schemas?.length }"
      submitOnReset
      v-bind="getFormProps"
      source="table-query"
      v-if="getBindValues.useSearchForm"
      :tableAction="tableAction"
      @register="registerForm"
      @submit="handleSearchInfoChange"
      @advanced-change="redoHeight"
    >
      <template #[replaceFormSlotKey(item)]="data" v-for="item in getFormSlotKeys">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
    </BasicForm>

    <!-- antd v3 升级兼容，阻止数据的收集，防止控制台报错 -->
    <!-- https://antdv.com/docs/vue/migration-v3-cn -->
    <a-form-item-rest>
      <!-- 【TV360X-377】关联记录必填影响到了table的输入框和页码样式 -->
      <a-form-item>
        <Table ref="tableElRef" v-bind="getBindValues" :rowClassName="getRowClassName" v-show="getEmptyDataIsShowTable" @resizeColumn="handleResizeColumn" @change="handleTableChange">
          <!-- antd的原生插槽直接传递 -->
          <template #[item]="data" v-for="item in slotNamesGroup.native" :key="item">
            <!-- update-begin--author:liaozhiyang---date:20240424---for：【issues/1146】BasicTable使用headerCell全选框出不来 -->
            <template v-if="item === 'headerCell'">
              <CustomSelectHeader v-if="isCustomSelection(data.column)" v-bind="selectHeaderProps" />
              <slot v-else :name="item" v-bind="data || {}"></slot>
            </template>
            <slot v-else :name="item" v-bind="data || {}"></slot>
            <!-- update-begin--author:liaozhiyang---date:20240424---for：【issues/1146】BasicTable使用headerCell全选框出不来 -->
          </template>
          <template #headerCell="{ column }">
            <!-- update-begin--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题 -->
            <CustomSelectHeader v-if="isCustomSelection(column)" v-bind="selectHeaderProps"/>
            <HeaderCell v-else :column="column" />
            <!-- update-end--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题 -->
          </template>
          <!-- 增加对antdv3.x兼容 -->
          <template #bodyCell="data">
            <!-- update-begin--author:liaozhiyang---date:220230717---for：【issues-179】antd3 一些警告以及报错(针对表格) -->
            <!-- update-begin--author:liusq---date:20230921---for：【issues/770】slotsBak异常报错的问题,增加判断column是否存在 -->
            <template v-if="data.column?.slotsBak?.customRender">
            <!-- update-end--author:liusq---date:20230921---for：【issues/770】slotsBak异常报错的问题,增加判断column是否存在 -->
              <slot :name="data.column.slotsBak.customRender" v-bind="data || {}"></slot>
            </template>
            <template v-else>
              <slot name="bodyCell" v-bind="data || {}"></slot>
            </template>
            <!-- update-begin--author:liaozhiyang---date:22030717---for：【issues-179】antd3 一些警告以及报错(针对表格) -->
          </template>
          <!-- update-begin--author:liaozhiyang---date:20240425---for：【pull/1201】添加antd的TableSummary功能兼容老的summary（表尾合计） -->
          <template v-if="showSummaryRef && !getBindValues.showSummary" #summary="data">
            <slot name="summary" v-bind="data || {}">
              <TableSummary :data="data || {}" v-bind="getSummaryProps" />
            </slot>
          </template>
          <!-- update-end--author:liaozhiyang---date:20240425---for：【pull/1201】添加antd的TableSummary功能兼容老的summary（表尾合计） -->
        </Table>
      </a-form-item>
    </a-form-item-rest>
  </div>
</template>
<script lang="ts">
  import type { BasicTableProps, TableActionType, SizeType, ColumnChangeParam, BasicColumn } from './types/table';

  import { defineComponent, ref, computed, unref, toRaw, inject, watchEffect, watch, onUnmounted, onMounted, nextTick } from 'vue';
  import { Table } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { PageWrapperFixedHeightKey } from '/@/components/Page/injectionKey';
  import CustomSelectHeader from './components/CustomSelectHeader.vue'
  import expandIcon from './components/ExpandIcon';
  import HeaderCell from './components/HeaderCell.vue';
  import TableSummary from './components/TableSummary';
  import { InnerHandlers } from './types/table';
  import { usePagination } from './hooks/usePagination';
  import { useColumns } from './hooks/useColumns';
  import { useDataSource } from './hooks/useDataSource';
  import { useLoading } from './hooks/useLoading';
  import { useRowSelection } from './hooks/useRowSelection';
  import { useTableScroll } from './hooks/useTableScroll';
  import { useCustomRow } from './hooks/useCustomRow';
  import { useTableStyle } from './hooks/useTableStyle';
  import { useTableHeader } from './hooks/useTableHeader';
  import { useTableExpand } from './hooks/useTableExpand';
  import { createTableContext } from './hooks/useTableContext';
  import { useTableFooter } from './hooks/useTableFooter';
  import { useTableForm } from './hooks/useTableForm';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useCustomSelection } from "./hooks/useCustomSelection";

  import { omit, pick } from 'lodash-es';
  import { basicProps } from './props';
  import { isFunction } from '/@/utils/is';
  import { warn } from '/@/utils/log';

  export default defineComponent({
    components: {
      Table,
      BasicForm,
      HeaderCell,
      TableSummary,
      CustomSelectHeader,
    },
    props: basicProps,
    emits: [
      'fetch-success',
      'fetch-error',
      'selection-change',
      'register',
      'row-click',
      'row-dbClick',
      'row-contextmenu',
      'row-mouseenter',
      'row-mouseleave',
      'edit-end',
      'edit-cancel',
      'edit-row-end',
      'edit-change',
      'expanded-rows-change',
      'change',
      'columns-change',
      'table-redo',
    ],
    setup(props, { attrs, emit, slots, expose }) {
      const tableElRef = ref(null);
      const tableData = ref<Recordable[]>([]);

      const wrapRef = ref(null);
      const innerPropsRef = ref<Partial<BasicTableProps>>();

      const { prefixCls } = useDesign('basic-table');
      const [registerForm, formActions] = useForm();

      const getProps = computed(() => {
        return { ...props, ...unref(innerPropsRef) } as BasicTableProps;
      });

      const isFixedHeightPage = inject(PageWrapperFixedHeightKey, false);
      watchEffect(() => {
        unref(isFixedHeightPage) &&
          props.canResize &&
          warn("'canResize' of BasicTable may not work in PageWrapper with 'fixedHeight' (especially in hot updates)");
      });

      const { getLoading, setLoading } = useLoading(getProps);
      const { getPaginationInfo, getPagination, setPagination, setShowPagination, getShowPagination } = usePagination(getProps);

      // update-begin--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题

      // const { getRowSelection, getRowSelectionRef, getSelectRows, clearSelectedRowKeys, getSelectRowKeys, deleteSelectRowByKey, setSelectedRowKeys } =
      //   useRowSelection(getProps, tableData, emit);

      // 子级列名
      const childrenColumnName = computed(() => getProps.value.childrenColumnName || 'children');

      // 自定义选择列
      const {
        getRowSelection,
        getSelectRows,
        getSelectRowKeys,
        setSelectedRowKeys,
        getRowSelectionRef,
        selectHeaderProps,
        isCustomSelection,
        handleCustomSelectColumn,
        clearSelectedRowKeys,
        deleteSelectRowByKey,
        getExpandIconColumnIndex,
      } = useCustomSelection(
        getProps,
        emit,
        wrapRef,
        getPaginationInfo,
        tableData,
        childrenColumnName
      )
      // update-end--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题

      const {
        handleTableChange: onTableChange,
        getDataSourceRef,
        getDataSource,
        getRawDataSource,
        setTableData,
        updateTableDataRecord,
        deleteTableDataRecord,
        insertTableDataRecord,
        findTableDataRecord,
        fetch,
        getRowKey,
        reload,
        getAutoCreateKey,
        updateTableData,
      } = useDataSource(
        getProps,
        {
          tableData,
          getPaginationInfo,
          setLoading,
          setPagination,
          validate: formActions.validate,
          clearSelectedRowKeys,
        },
        emit
      );

      function handleTableChange(...args) {
        onTableChange.call(undefined, ...args);
        emit('change', ...args);
        // 解决通过useTable注册onChange时不起作用的问题
        const { onChange } = unref(getProps);
        onChange && isFunction(onChange) && onChange.call(undefined, ...args);
      }

      const { getViewColumns, getColumns, getRefColumns, setCacheColumnsByField, setColumns, getColumnsRef, getCacheColumns } = useColumns(
        getProps,
        getPaginationInfo,
        // update-begin--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题
        handleCustomSelectColumn,
        // update-end--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题
      );

      const { getScrollRef, redoHeight } = useTableScroll(getProps, tableElRef, getColumnsRef, getRowSelectionRef, getDataSourceRef, slots, getPaginationInfo);

      const { customRow } = useCustomRow(getProps, {
        setSelectedRowKeys,
        getSelectRowKeys,
        clearSelectedRowKeys,
        getAutoCreateKey,
        emit,
      });

      const { getRowClassName } = useTableStyle(getProps, prefixCls);

      const { getExpandOption, expandAll, collapseAll } = useTableExpand(getProps, tableData, emit);

      const handlers: InnerHandlers = {
        onColumnsChange: (data: ColumnChangeParam[]) => {
          emit('columns-change', data);
          // support useTable
          unref(getProps).onColumnsChange?.(data);
        },
      };

      const { getHeaderProps } = useTableHeader(getProps, slots, handlers);
      // update-begin--author:liaozhiyang---date:20240425---for：【pull/1201】添加antd的TableSummary功能兼容老的summary（表尾合计）
      const getSummaryProps = computed(() => {
        // update-begin--author:liaozhiyang---date:20250318---for：【issues/7956】修复showSummary: false时且有内嵌子表时合计栏错位
        const result = pick(unref(getProps), ['summaryFunc', 'summaryData', 'hasExpandedRow', 'rowKey']);
        result['hasExpandedRow'] = Object.keys(slots).includes('expandedRowRender');
        // update-end--author:liaozhiyang---date:20250318---for：【issues/7956】修复showSummary: false时且有内嵌子表时合计栏错位
        return result;
      });
      const getIsEmptyData = computed(() => {
        return (unref(getDataSourceRef) || []).length === 0;
      });
      const showSummaryRef = computed(() => {
        const summaryProps = unref(getSummaryProps);
        return (summaryProps.summaryFunc || summaryProps.summaryData) && !unref(getIsEmptyData);
      });
      // update-end--author:liaozhiyang---date:20240425---for：【pull/1201】添加antd的TableSummary功能兼容老的summary（表尾合计）

      const { getFooterProps } = useTableFooter(getProps, slots, getScrollRef, tableElRef, getDataSourceRef);

      const { getFormProps, replaceFormSlotKey, getFormSlotKeys, handleSearchInfoChange } = useTableForm(getProps, slots, fetch, getLoading);

      const getBindValues = computed(() => {
        const dataSource = unref(getDataSourceRef);
        let propsData: Recordable = {
          // date-begin--author:liaozhiyang---date:20250716---for：【issues/8564】basicTale的TableLayout换成auto不生效
          tableLayout: 'fixed',
          // date-begin--author:liaozhiyang---date:20250716---for：【issues/8564】basicTale的TableLayout换成auto不生效
          // ...(dataSource.length === 0 ? { getPopupContainer: () => document.body } : {}),
          ...attrs,
          customRow,
          //树列表展开使用AntDesignVue默认的加减图标 author:scott date:20210914
          //expandIcon: slots.expandIcon ? null : expandIcon(),
          ...unref(getProps),
          ...unref(getHeaderProps),
          scroll: unref(getScrollRef),
          loading: unref(getLoading),
          rowSelection: unref(getRowSelectionRef),
          rowKey: unref(getRowKey),
          columns: toRaw(unref(getViewColumns)),
          pagination: toRaw(unref(getPaginationInfo)),
          dataSource,
          footer: unref(getFooterProps),
          ...unref(getExpandOption),
          // 【QQYUN-5837】动态计算 expandIconColumnIndex
          expandIconColumnIndex: getExpandIconColumnIndex.value,
        };

        //update-begin---author:wangshuai ---date:20230214  for：[QQYUN-4237]代码生成 内嵌子表模式 没有滚动条------------
        //额外的展开行存在插槽时会将滚动移除掉,注释掉
        /*if (slots.expandedRowRender) {
          propsData = omit(propsData, 'scroll');
        }*/
        //update-end---author:wangshuai ---date:20230214  for：[QQYUN-4237]代码生成 内嵌子表模式 没有滚动条------------ 

        // update-begin--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题
        // 自定义选择列，需要去掉原生的
        delete propsData.rowSelection
        // update-end--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题

        // update-begin--author:liaozhiyang---date:20230919---for：【QQYUN-6387】展开写法（去掉报错）
        !propsData.isTreeTable && delete propsData.expandIconColumnIndex;
        propsData.expandedRowKeys === null && delete propsData.expandedRowKeys;
        // update-end--author:liaozhiyang---date:20230919---for：【QQYUN-6387】展开写法（去掉报错）
        propsData = omit(propsData, ['class', 'onChange']);
        return propsData;
      });

      // 统一设置表格列宽度
      const getMaxColumnWidth = computed(() => {
        const values = unref(getBindValues);
        return values.maxColumnWidth > 0 ? values.maxColumnWidth + 'px' : null;
      });

      const getWrapperClass = computed(() => {
        const values = unref(getBindValues);
        return [
          prefixCls,
          attrs.class,
          {
            [`${prefixCls}-form-container`]: values.useSearchForm,
            [`${prefixCls}--inset`]: values.inset,
            [`${prefixCls}-col-max-width`]: getMaxColumnWidth.value != null,
            // 是否显示表尾合计
            [`${prefixCls}--show-summary`]: values.showSummary,
          },
        ];
      });

      const getEmptyDataIsShowTable = computed(() => {
        const { emptyDataIsShowTable, useSearchForm } = unref(getProps);
        if (emptyDataIsShowTable || !useSearchForm) {
          return true;
        }
        return !!unref(getDataSourceRef).length;
      });

      function setProps(props: Partial<BasicTableProps>) {
        innerPropsRef.value = { ...unref(innerPropsRef), ...props };
      }

      const tableAction: TableActionType = {
        reload,
        getSelectRows,
        clearSelectedRowKeys,
        getSelectRowKeys,
        deleteSelectRowByKey,
        setPagination,
        setTableData,
        updateTableDataRecord,
        deleteTableDataRecord,
        insertTableDataRecord,
        findTableDataRecord,
        redoHeight,
        setSelectedRowKeys,
        setColumns,
        setLoading,
        getDataSource,
        getRawDataSource,
        setProps,
        getRowSelection,
        getPaginationRef: getPagination,
        getColumns,
        // update-begin--author:liaozhiyang---date:20250722---for：【issues/8529】setColumns后列配置没联动更新
        getColumnsRef: () => getColumnsRef,
        // update-end--author:liaozhiyang---date:20250722---for：【issues/8529】setColumns后列配置没联动更新
        getCacheColumns,
        emit,
        updateTableData,
        setShowPagination,
        getShowPagination,
        setCacheColumnsByField,
        expandAll,
        collapseAll,
        getSize: () => {
          return unref(getBindValues).size as SizeType;
        },
        // update-begin--author:liaozhiyang---date:20250904---for：【QQYUN-13558】erp风格主表在5条数据时也有滚动条
        getBindValuesRef: () => getBindValues,
        // update-end--author:liaozhiyang---date:20250904---for：【QQYUN-13558】erp风格主表在5条数据时也有滚动条
      };
      createTableContext({ ...tableAction, wrapRef, getBindValues });

      // update-begin--author:sunjianlei---date:220230718---for：【issues/179】兼容新老slots写法，移除控制台警告
      // 获取分组之后的slot名称
      const slotNamesGroup = computed<{
        // AntTable原生插槽
        native: string[];
        // 列自定义插槽
        custom: string[];
      }>(() => {
        const native: string[] = [];
        const custom: string[] = [];
        const columns = unref<Recordable[]>(getViewColumns) as BasicColumn[];
        const allCustomRender = columns.map<string>((column) => column.slotsBak?.customRender);
        for (const name of Object.keys(slots)) {
          // 过滤特殊的插槽
          if (['bodyCell'].includes(name)) {
            continue;
          }
          if (allCustomRender.includes(name)) {
            custom.push(name);
          } else {
            native.push(name);
          }
        }
        return { native, custom };
      });
      // update-end--author:sunjianlei---date:220230718---for：【issues/179】兼容新老slots写法，移除控制台警告
      // update-begin--author:liaozhiyang---date:20231226---for：【issues/945】BasicTable组件设置默认展开不生效
      nextTick(() => {
        getProps.value.defaultExpandAllRows && expandAll();
      })
      // update-end--author:sunjianlei---date:20231226---for：【issues/945】BasicTable组件设置默认展开不生效
      // update-begin--author:liaozhiyang---date:20241225---for：【issues/7588】选择后自动刷新表格
      expose({ ...tableAction, handleSearchInfoChange });
      // update-end--author:liaozhiyang---date:20241225---for：【issues/7588】选择后自动刷新表格

      emit('register', tableAction, formActions);



      // 根据 col 对象计算其在 DOM thList 与 <col> 中的绝对 0-based 索引
      function getDOMColIndex(col: any): number {
        if (!wrapRef.value) return -1;
        const thList = Array.from(wrapRef.value.querySelectorAll('.ant-table-thead > tr > th:not(.ant-table-cell-scrollbar)')) as HTMLElement[];
        if (!thList.length) return -1;

        const viewCols = unref(getViewColumns);

        // 1. 尝试对象的引用对比（Vue 响应式 Proxy 解包）
        let viewIndex = viewCols.findIndex((c: any) => c === col || toRaw(c) === toRaw(col));

        // 2. 尝试字段值对比 (dataIndex / flag / key / title)
        if (viewIndex === -1) {
          viewIndex = viewCols.findIndex((c: any) => {
            if (col['dataIndex'] != null && c['dataIndex'] != null) {
              return String(c['dataIndex']) === String(col['dataIndex']);
            }
            if (col['flag'] != null && c['flag'] != null) {
              return String(c['flag']) === String(col['flag']);
            }
            if (col['key'] != null && c['key'] != null) {
              return String(c['key']) === String(col['key']);
            }
            if (col['title'] != null && c['title'] != null) {
              return String(c['title']) === String(col['title']);
            }
            return false;
          });
        }

        if (viewIndex === -1) return -1;

        // 3. 校验 viewCols 的首列是否已包含复选框/序号列
        const firstTH = thList[0];
        const isFirstTHSelection = firstTH?.classList.contains('ant-table-selection-column') ||
                                   firstTH?.querySelector('.ant-checkbox') != null ||
                                   firstTH?.querySelector('.custom-select-header') != null;
        
        const firstColIsSelection = viewCols[0]?.flag === 'CHECKBOX' ||
                                    viewCols[0]?.flag === 'INDEX' ||
                                    viewCols[0]?.dataIndex === 'selection' ||
                                    viewCols[0]?.key === 'selection' ||
                                    viewCols[0]?.key === 'CHECKBOX';

        // 如果 DOM 有 Selection TH 且 viewCols 未包含 Selection 列，则需要 +1 偏移
        if (isFirstTHSelection && !firstColIsSelection) {
          return viewIndex + 1;
        }

        return viewIndex;
      }

      // 动态读取表体真实纵向滚动条宽度（没有滚动条时严格返回 0）
      function getScrollbarWidth(): number {
        if (!wrapRef.value) return 0;
        const bodyEl = wrapRef.value.querySelector('.ant-table-body') as HTMLElement;
        const tbodyEl = wrapRef.value.querySelector('.ant-table-tbody') as HTMLElement;
        if (!bodyEl || !tbodyEl) return 0;

        // 物理真理判定：对比 tbody 数据行真实物理高度 (tbody.offsetHeight) 与容器可见高度 (bodyEl.clientHeight)
        const hasScrollbar = bodyEl.clientHeight > 0 && tbodyEl.offsetHeight > bodyEl.clientHeight;
        if (!hasScrollbar) return 0;

        const sbWidth = bodyEl.offsetWidth - bodyEl.clientWidth;
        return sbWidth > 0 ? sbWidth : 0;
      }

      // 强行给表头 <colgroup>、表体 <colgroup> 及 TH 注入完全相等的 colWidths 数组，保证表头与表体网格线 100% 绝对对齐
      function ensureAllColWidthsExcept(targetColIndex: number = -1, targetW: number = 0) {
        if (!wrapRef.value) return;
        const thList = Array.from(wrapRef.value.querySelectorAll('.ant-table-thead > tr > th:not(.ant-table-cell-scrollbar)')) as HTMLElement[];
        const headerCols = Array.from(wrapRef.value.querySelectorAll('.ant-table-header col')) as HTMLTableColElement[];
        const bodyCols = Array.from(wrapRef.value.querySelectorAll('.ant-table-body col')) as HTMLTableColElement[];
        if (!thList.length || (!headerCols.length && !bodyCols.length)) return;

        const viewCols = unref(getViewColumns);
        const scrollbarW = getScrollbarWidth();

        // 当 viewCols 长度与 DOM thList 长度 1:1 相同时（均包含 Selection 列），无需做索引 -1 偏移
        const useViewColsDirectly = viewCols.length === thList.length;

        // 1. 构建与 DOM thList 节点 1:1 对应的绝对像素宽度数组
        const colWidths: number[] = [];
        for (let i = 0; i < thList.length; i++) {
          if (i === targetColIndex) {
            colWidths[i] = Math.max(50, targetW);
          } else {
            const vIdx = useViewColsDirectly ? i : (i === 0 ? -1 : i - 1);
            if (vIdx === -1) {
              colWidths[0] = 50;
            } else {
              const vcW = viewCols[vIdx]?.width ? Number(viewCols[vIdx].width) : 0;
              if (vcW > 0) {
                colWidths[i] = Math.max(50, Math.round(vcW));
              } else if (targetColIndex === -1 && thList[i]) {
                const domW = Math.round(thList[i].getBoundingClientRect().width);
                colWidths[i] = Math.max(50, domW);
              } else {
                colWidths[i] = 100;
              }
            }
          }
        }

        // 2. 如果数据列宽度总和小于容器宽度，自动将剩余空间分配给最后一列数据列，保证列宽精确充满 100% 容器且 13/12 列绝对平铺对齐
        const rawTotalColsW = colWidths.reduce((sum, w) => sum + w, 0);
        const containerEl = (wrapRef.value.querySelector('.ant-table-body') as HTMLElement) || wrapRef.value;
        const containerW = containerEl ? containerEl.clientWidth : 0;
        const availableW = Math.max(0, containerW - scrollbarW);

        if (containerW > 0 && rawTotalColsW < availableW && colWidths.length > 0) {
          const extraW = availableW - rawTotalColsW;
          colWidths[colWidths.length - 1] += extraW;
        }

        const finalColsW = colWidths.reduce((sum, w) => sum + w, 0);

        // 3. 分别强行对表头 <colgroup> 与表体 <colgroup> 的每一个 col 节点注入完全相同的 width 样式与 HTML width 属性
        headerCols.forEach((colEl: HTMLTableColElement, idx: number) => {
          if (idx < colWidths.length) {
            const wStr = `${colWidths[idx]}px`;
            colEl.style.width = wStr;
            colEl.setAttribute('width', `${colWidths[idx]}`);
          } else if (idx === colWidths.length && scrollbarW > 0) {
            colEl.style.width = `${scrollbarW}px`;
            colEl.setAttribute('width', `${scrollbarW}`);
          } else {
            colEl.style.width = '0px';
            colEl.setAttribute('width', '0');
          }
        });

        bodyCols.forEach((colEl: HTMLTableColElement, idx: number) => {
          if (idx < colWidths.length) {
            const wStr = `${colWidths[idx]}px`;
            colEl.style.width = wStr;
            colEl.setAttribute('width', `${colWidths[idx]}`);
          } else {
            colEl.style.width = '0px';
            colEl.setAttribute('width', '0');
          }
        });

        // 4. 强行同步表头 <th> 与表体首行 <td> 的 inline 样式宽度 (width / minWidth / maxWidth)
        const firstTdList = Array.from(wrapRef.value.querySelectorAll('.ant-table-tbody > tr:first-child > td:not(.ant-table-cell-scrollbar)')) as HTMLElement[];
        [thList, firstTdList].forEach((cellList) => {
          cellList.forEach((cellEl: HTMLElement, idx: number) => {
            if (idx < colWidths.length) {
              const wStr = `${colWidths[idx]}px`;
              cellEl.style.width = wStr;
              cellEl.style.minWidth = wStr;
              cellEl.style.maxWidth = wStr;
            }
          });
        });

        // 5. 同步更新表头右侧滚动条占位 TH (th.ant-table-cell-scrollbar)
        const scrollbarTH = wrapRef.value.querySelector('.ant-table-thead > tr > th.ant-table-cell-scrollbar') as HTMLElement;
        if (scrollbarTH) {
          if (scrollbarW > 0) {
            const sbStr = `${scrollbarW}px`;
            scrollbarTH.style.width = sbStr;
            scrollbarTH.style.minWidth = sbStr;
            scrollbarTH.style.maxWidth = sbStr;
            scrollbarTH.style.display = '';
          } else {
            scrollbarTH.style.width = '0px';
            scrollbarTH.style.minWidth = '0px';
            scrollbarTH.style.maxWidth = '0px';
            scrollbarTH.style.padding = '0';
            scrollbarTH.style.margin = '0';
            scrollbarTH.style.border = 'none';
            scrollbarTH.style.display = 'none';
          }
        }

        // 6. 强行同步 headerTable 与 bodyTable 的 <table> 节点整体像素宽度，并追加 !important 彻底覆写 AntD Vue 默认的 width: max-content 内联样式
        const headerTableEl = wrapRef.value.querySelector('.ant-table-header table') as HTMLElement;
        const bodyTableEl = wrapRef.value.querySelector('.ant-table-body table') as HTMLElement;
        if (headerTableEl) {
          const hWidthStr = `${finalColsW + scrollbarW}px`;
          headerTableEl.style.setProperty('width', hWidthStr, 'important');
          headerTableEl.style.setProperty('min-width', hWidthStr, 'important');
          headerTableEl.style.setProperty('max-width', hWidthStr, 'important');
        }
        if (bodyTableEl) {
          const bWidthStr = `${finalColsW}px`;
          bodyTableEl.style.setProperty('width', bWidthStr, 'important');
          bodyTableEl.style.setProperty('min-width', bWidthStr, 'important');
          bodyTableEl.style.setProperty('max-width', bWidthStr, 'important');
        }

        // 7. 动态防闪烁：总列宽小于等于容器宽时，强行屏蔽横向滚动条；只有真正超出容器时才开启横向滚动条
        if (containerEl && containerW > 0) {
          if (finalColsW <= containerW + 1) {
            containerEl.style.setProperty('overflow-x', 'hidden', 'important');
          } else {
            containerEl.style.setProperty('overflow-x', 'auto', 'important');
          }
        }

        // 初始化/刷新诊断日志输出
        if (targetColIndex === -1) {
          console.log(`[AlignInit] rawTotalColsW:${rawTotalColsW}px | finalColsW:${finalColsW}px | containerW:${containerW}px | scrollbarW:${scrollbarW}px | useViewColsDirectly:${useViewColsDirectly}`);
          console.log(`[AlignInit] colWidths(${colWidths.length}):`, colWidths);
          console.log(`[AlignInit] TH测得宽度(${thList.length}):`, thList.map((th) => Math.round(th.getBoundingClientRect().width)));
          console.log(`[AlignInit] TD测得宽度(${firstTdList.length}):`, firstTdList.map((td) => Math.round(td.getBoundingClientRect().width)));
          console.log(`[AlignInit] HeaderCols样式宽(${headerCols.length}):`, headerCols.map((c) => c.style.width || c.getAttribute('width') || 'auto'));
          console.log(`[AlignInit] BodyCols样式宽(${bodyCols.length}):`, bodyCols.map((c) => c.style.width || c.getAttribute('width') || 'auto'));
          console.log(`[AlignInit] headerTable宽:${headerTableEl?.offsetWidth ?? 'N/A'}px | bodyTable宽:${bodyTableEl?.offsetWidth ?? 'N/A'}px`);
        }
      }

      function handleResizeColumn(w: number, col: any) {
        const targetWidth = Math.max(50, Math.round(w));

        // 1. 获取准确的 0-based DOM 列索引
        const domColIndex = getDOMColIndex(col);

        // 2. 按索引精确同步更新 ViewColumns（前端 DOM 展现层）
        const viewColumns = unref(getViewColumns);
        if (domColIndex !== -1 && viewColumns[domColIndex]) {
          viewColumns[domColIndex].width = targetWidth;
        } else {
          const findViewItem = viewColumns.find((item: any) => {
            if (item === col || toRaw(item) === toRaw(col)) return true;
            if (item['dataIndex'] != null && col['dataIndex'] != null) return String(item['dataIndex']) === String(col['dataIndex']);
            if (item['key'] != null && col['key'] != null) return String(item['key']) === String(col['key']);
            if (item['title'] != null && col['title'] != null) return String(item['title']) === String(col['title']);
            return false;
          });
          if (findViewItem) findViewItem.width = targetWidth;
        }

        // 3. 按索引精确同步更新 Source Columns（防止 computed(getColumnsRef) 的 cloneDeep 异步生成旧宽度）
        const sourceColumns = getColumns();
        if (Array.isArray(sourceColumns)) {
          if (domColIndex !== -1 && sourceColumns[domColIndex]) {
            sourceColumns[domColIndex].width = targetWidth;
          } else {
            const findSourceItem = sourceColumns.find((item: any) => {
              if (item === col || toRaw(item) === toRaw(col)) return true;
              if (item['dataIndex'] != null && col['dataIndex'] != null) return String(item['dataIndex']) === String(col['dataIndex']);
              if (item['key'] != null && col['key'] != null) return String(item['key']) === String(col['key']);
              if (item['title'] != null && col['title'] != null) return String(item['title']) === String(col['title']);
              return false;
            });
            if (findSourceItem) findSourceItem.width = targetWidth;
          }
        }

        col.width = targetWidth;
        const fieldKey = col.dataIndex || col.key || (domColIndex !== -1 && viewColumns[domColIndex]?.dataIndex) || (domColIndex !== -1 && viewColumns[domColIndex]?.key);
        if (fieldKey) {
          setCacheColumnsByField(fieldKey, { width: targetWidth });
        }

        // 4. 准确注入全表 <col> / TH / TD 宽度，并在 RAF 中再次同步以防止 AntD 异步覆写
        if (domColIndex !== -1) {
          ensureAllColWidthsExcept(domColIndex, targetWidth);
          requestAnimationFrame(() => {
            ensureAllColWidthsExcept(domColIndex, targetWidth);
          });
        }

        // 诊断日志：记录 DOM 测量数据与 ComputedStyle
        nextTick(() => {
          if (!wrapRef.value) return;
          const headerTable = wrapRef.value.querySelector('.ant-table-header table') as HTMLElement;
          const bodyTable = wrapRef.value.querySelector('.ant-table-body table') as HTMLElement;
          const thList = Array.from(wrapRef.value.querySelectorAll('.ant-table-thead > tr > th')) as HTMLElement[];
          const firstTdList = Array.from(wrapRef.value.querySelectorAll('.ant-table-tbody > tr:first-child > td')) as HTMLElement[];
          const headerCols = Array.from(wrapRef.value.querySelectorAll('.ant-table-header col')) as HTMLTableColElement[];
          const bodyCols = Array.from(wrapRef.value.querySelectorAll('.ant-table-body col')) as HTMLTableColElement[];

          console.log(`[AlignDiag] 列:${col['title']} | targetW:${targetWidth}px`);
          console.log(`[AlignDiag] headerTable宽:${headerTable?.offsetWidth ?? 'N/A'}px | bodyTable宽:${bodyTable?.offsetWidth ?? 'N/A'}px`);
          console.log(`[AlignDiag] TH测得宽度(${thList.length}):`, thList.map((th) => Math.round(th.getBoundingClientRect().width)));
          console.log(`[AlignDiag] TD测得宽度(${firstTdList.length}):`, firstTdList.map((td) => Math.round(td.getBoundingClientRect().width)));
          console.log(`[AlignDiag] HeaderCols样式宽(${headerCols.length}):`, headerCols.map((c) => c.style.width || c.getAttribute('width') || 'auto'));
          console.log(`[AlignDiag] BodyCols样式宽(${bodyCols.length}):`, bodyCols.map((c) => c.style.width || c.getAttribute('width') || 'auto'));
        });
      }

      // 监听数据与列配置变化，自动同步表头右侧滚动条占位 TH
      watch(
        [getDataSourceRef, () => unref(getViewColumns)],
        () => {
          nextTick(() => {
            ensureAllColWidthsExcept();
            requestAnimationFrame(() => ensureAllColWidthsExcept());
          });
        },
        { deep: true }
      );

      // DOM 变动与尺寸监听器：处理 AntD 异步挂载 <thead> / <tbody>
      let domObserver: MutationObserver | null = null;
      let resizeObserver: ResizeObserver | null = null;

      onMounted(() => {
        nextTick(() => {
          ensureAllColWidthsExcept();
          requestAnimationFrame(() => ensureAllColWidthsExcept());
          setTimeout(() => ensureAllColWidthsExcept(), 100);
          setTimeout(() => ensureAllColWidthsExcept(), 300);

          if (wrapRef.value) {
            domObserver = new MutationObserver(() => {
              ensureAllColWidthsExcept();
            });
            domObserver.observe(wrapRef.value, {
              childList: true,
              subtree: true,
            });

            resizeObserver = new ResizeObserver(() => {
              ensureAllColWidthsExcept();
            });
            resizeObserver.observe(wrapRef.value);
          }
        });
      });

      onUnmounted(() => {
        if (domObserver) {
          domObserver.disconnect();
          domObserver = null;
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
      });
      // update-end--author:antigravity---date:20260802---for：【表格列拖拽优化】基于 AntD 原生 resize 事件 + RAF DOM 同步，实现 1:1 跟手列宽拖拽
      // update-end--author:antigravity---date:20260802---for：【表格列拖拽优化】冻结列宽 + 鼠标几何法，彻底解决先慢后快问题

      return {
        tableElRef,
        getBindValues,
        getLoading,
        registerForm,
        handleSearchInfoChange,
        getEmptyDataIsShowTable,
        handleTableChange,
        getRowClassName,
        wrapRef,
        tableAction,
        redoHeight,
        handleResizeColumn,
        getFormProps: getFormProps as any,
        replaceFormSlotKey,
        getFormSlotKeys,
        getWrapperClass,
        getMaxColumnWidth,
        columns: getViewColumns,

        // update-begin--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题
        selectHeaderProps,
        isCustomSelection,
        // update-end--author:sunjianlei---date:220230630---for：【QQYUN-5571】自封装选择列，解决数据行选择卡顿问题
        slotNamesGroup,
        // update-begin--author:liaozhiyang---date:20240425---for：【pull/1201】添加antd的TableSummary功能兼容老的summary（表尾合计）
        getSummaryProps,
        showSummaryRef,
        // update-end--author:liaozhiyang---date:20240425---for：【pull/1201】添加antd的TableSummary功能兼容老的summary（表尾合计）
      };
    },
  });
</script>
<style lang="less">
  @border-color: #cecece4d;

  @prefix-cls: ~'@{namespace}-basic-table';

  [data-theme='dark'] {
    .ant-table-tbody > tr:hover.ant-table-row-selected > td,
    .ant-table-tbody > tr.ant-table-row-selected td {
      background-color: #262626;
    }

    .@{prefix-cls} {
      //表格选择工具栏样式
      .alert {
        // background-color: #323232;
        // border-color: #424242;
      }
    }
  }

  .@{prefix-cls} {
    max-width: 100%;

    &-row__striped {
      td {
        background-color: @app-content-background;
      }
    }
    // update-begin--author:liaozhiyang---date:20240613---for：【TV360X-1232】查询区域隐藏后点击刷新不走请求了(采用css隐藏)
    > .table-search-area-hidden {
      display: none;
    }
    // update-end--author:liaozhiyang---date:20240613---for：【TV360X-1232】查询区域隐藏后点击刷新不走请求了(采用css隐藏)
    &-form-container {
      padding: 10px;

      .ant-form {
        padding: 12px 10px 6px 10px;
        margin-bottom: 8px;
        background-color: @component-background;
        border-radius: 2px;
      }
    }

    .ant-tag {
      margin-right: 0;
    }

    //update-begin-author:liusq---date:20230517--for: [issues/526]RangePicker 设置预设范围按钮样式问题---
    .ant-picker-preset {
      .ant-tag {
        margin-right: 8px !important;
      }
    }
    //update-end-author:liusq---date:20230517--for: [issues/526]RangePicker 设置预设范围按钮样式问题---

    .ant-table-wrapper {
      padding: 6px;
      background-color: @component-background;
      border-radius: 2px;

      .ant-table-title {
        min-height: 40px;
        padding: 0 0 8px 0 !important;
      }

      .ant-table.ant-table-bordered .ant-table-title {
        border: none !important;
      }
    }

    .ant-table {
      &-title {
        display: flex;
        padding: 8px 6px;
        border-bottom: none;
        justify-content: space-between;
        align-items: center;
      }
      //定义行颜色
      .trcolor {
        background-color: rgba(255, 192, 203, 0.31);
        color: red;
      }
    }

    .ant-pagination {
      margin: 10px 0 0 0;
    }

    .ant-table-footer {
      padding: 0;

      .ant-table-wrapper {
        padding: 0;
      }

      table {
        border: none !important;
      }

      td {
        padding: 12px 8px;
      }
    }
    //表格选择工具栏样式
    .alert {
      height: 38px;
      // background-color: #e6f7ff;
      // border-color: #91d5ff;
    }
    &--inset {
      .ant-table-wrapper {
        padding: 0;
      }
    }

    // ------ 统一设置表格列最大宽度 ------
    &-col-max-width {
      .ant-table-thead tr th,
      .ant-table-tbody tr td {
        max-width: v-bind(getMaxColumnWidth);
      }
    }
    // ------ 统一设置表格列最大宽度 ------

    // update-begin--author:sunjianlei---date:220230718---for：【issues/622】修复表尾合计错位的问题
    &--show-summary {
      .ant-table > .ant-table-footer {
        padding: 12px 0 0;
      }
      .ant-table > .ant-table-footer {
        // update-begin--author:liaozhiyang---date:20241111---for：【issues/7413】合计行有点对不齐
        padding-left: 0 !important;
        padding-right: 0 !important;
        // update-end--author:liaozhiyang---date:20241111---for：【issues/7413】合计行有点对不齐
      }
      .ant-table.ant-table-bordered > .ant-table-footer {
        border: 0;
      }
    }
    // update-end--author:sunjianlei---date:220230718---for：【issues/622】修复表尾合计错位的问题
    // update-begin--author:liaozhiyang---date:20240604---for：【TV360X-377】关联记录必填影响到了table的输入框和页码样式
    > .ant-form-item {
      margin-bottom: 0;
    }
    // update-end--author:liaozhiyang---date:20240604---for：【TV360X-377】关联记录必填影响到了table的输入框和页码样式
  }
</style>
