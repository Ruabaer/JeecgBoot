<template>
  <div class="jeecg-detail-form">
    <a-row>
      <template v-for="(item, index) in schemasWithFillers" :key="index">
        <!-- 行末填充格：补全剩余列的边框 -->
        <a-col v-if="(item as any).isFiller" :span="(item as any).span">
          <div class="detail-item filler-item"></div>
        </a-col>
        <!-- 正常字段 -->
        <a-col v-else :span="getColSpan(item as FormSchema)">
          <div class="detail-item">
            <div class="item-label" :style="getLabelStyle(item as FormSchema)" :title="String((item as FormSchema).label)">
              {{ (item as FormSchema).label }}：
            </div>
            <div class="item-content" :class="getContentClass(item as FormSchema)">
              <!-- 富文本：v-html 渲染 -->
              <span v-if="isHtml(item as FormSchema)" v-html="getValue(item as FormSchema) || ''" class="html-content" />
              <!-- 普通文本 -->
              <span v-else>{{ getValue(item as FormSchema) }}</span>
            </div>
          </div>
        </a-col>
      </template>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import type { FormSchema } from '/@/components/Form';

  const props = defineProps<{
    schemas: FormSchema[];
    data: Record<string, any>;
    defaultSpan?: number;
  }>();

  // 基础列宽（如 8 表示 3 列布局）
  const baseSpan = computed(() => props.defaultSpan ?? 8);

  // 过滤掉隐藏字段（show: false 或无 label 的辅助字段如 id）
  const visibleSchemas = computed(() =>
    props.schemas.filter((s) => {
      if (s.show === false) return false;
      if (!s.label) return false;
      return true;
    })
  );

  type FillerItem = { isFiller: true; span: number };
  type RenderItem = FormSchema | FillerItem;

  /**
   * 在每行末尾插入填充格，确保每行的 span 之和恰好为 24。
   * 填充格会携带 border-right，从而补全行末的视觉边框。
   */
  const schemasWithFillers = computed<RenderItem[]>(() => {
    const result: RenderItem[] = [];
    let rowUsed = 0;
    for (const schema of visibleSchemas.value) {
      const span = getColSpan(schema);
      // 如果加入此字段会溢出，先补填充格
      if (rowUsed + span > 24) {
        result.push({ isFiller: true, span: 24 - rowUsed });
        rowUsed = 0;
      }
      result.push(schema);
      rowUsed += span;
      if (rowUsed >= 24) rowUsed = 0;
    }
    // 最后一行未填满时补填充格
    if (rowUsed > 0 && rowUsed < 24) {
      result.push({ isFiller: true, span: 24 - rowUsed });
    }
    return result;
  });

  /** 是否为富文本字段 */
  function isHtml(schema: FormSchema) {
    return schema.component === 'JEditor';
  }

  /** 获取字段展示值：优先读 field_dictText（字典翻译值），不存在则回退到原始值 */
  function getValue(schema: FormSchema) {
    const field = schema.field as string;
    const data = props.data ?? {};
    // JeecgBoot 列表接口同时返回原始值和翻译值（如 sex=1, sex_dictText=男）
    // detailData 来自列表行记录，故翻译值已存在，直接优先使用
    const dictTextField = field + '_dictText';
    if (dictTextField in data && data[dictTextField] != null && data[dictTextField] !== '') {
      return data[dictTextField];
    }
    return data[field] ?? '';
  }

  /** 获取字段列宽（优先取 colProps.span，否则 defaultSpan） */
  function getColSpan(schema: FormSchema) {
    return (schema.colProps as any)?.span ?? baseSpan.value;
  }

  /**
   * 计算 label 宽度，使所有行的 label 在视觉上保持一致宽度。
   * 核心逻辑：label 宽度始终等价于「defaultSpan 列宽的 24%」。
   * - 普通字段（span = defaultSpan）：label = 24% of col → 始终一致
   * - 全行字段（span = 24）：label = (defaultSpan/24 * 24)% of full row = defaultSpan%
   *   例如 defaultSpan=8 → 8% of full row，与普通字段 24% of 1/3 row 视觉相同
   */
  function getLabelStyle(schema: FormSchema): Record<string, string> {
    const colSpan = getColSpan(schema);
    const base = baseSpan.value;
    const baseWidth = 24; // 正常列内 label 占比(%)

    if (colSpan > base) {
      // 全行或跨多列字段：等比缩放 label 宽度，保持与普通字段视觉一致
      const pct = ((base / colSpan) * baseWidth).toFixed(2);
      return { width: `${pct}%`, maxWidth: '160px', minWidth: '60px' };
    }
    return { width: `${baseWidth}%`, maxWidth: '160px', minWidth: '60px' };
  }

  /** 富文本内容区加特殊类以便竖向展示 */
  function getContentClass(schema: FormSchema) {
    if (isHtml(schema)) return 'umeditor';
    return '';
  }
</script>

<style lang="less" scoped>
  @border-color: #f0f0f0;

  .jeecg-detail-form {
    // 容器提供完整四边外框
    border: 1px solid @border-color;
    // 底边由最后一行的 detail-item 的 border-bottom 补充，容器本身保留底边防止最后行不满时缺口
    border-bottom: none;

    // 消除 a-row/a-col 自带的 gutter padding
    :deep(.ant-row) {
      margin: 0 !important;
    }
    :deep(.ant-col) {
      padding: 0 !important;
    }

    .detail-item {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      min-height: 40px;
      height: 100%;
      // 每个 item 提供行底部分隔线（最后一行同时充当外框底边）
      border-bottom: 1px solid @border-color;
      word-break: break-all;

      // 填充格：空单元格，仅携带边框补全行末视觉
      &.filler-item {
        border-right: 1px solid @border-color;
        flex: 1;
      }

      .item-label {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-shrink: 0;
        flex-grow: 0;
        padding: 8px 2px 8px 2px;
        background: #fafafa;
        color: #000;
        font-weight: 500;
        border-right: 1px solid @border-color;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .item-content {
        flex-grow: 1;
        flex-shrink: 1;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        min-width: 0;
        // 每列右侧分隔线（最后一列的 border-right 与容器外框重叠，同色无影响）
        border-right: 1px solid @border-color;

        // 富文本竖向撑开
        &.umeditor {
          display: block;
          padding: 8px 12px;

          .html-content {
            display: block;
            line-height: 1.6;

            :deep(p) { margin: 0 0 4px; }
            :deep(ul), :deep(ol) { padding-left: 20px; margin: 4px 0; }
            :deep(img) { max-width: 100%; }
            :deep(strong) { font-weight: bold; }
            :deep(em) { font-style: italic; }
          }
        }
      }
    }
  }
</style>