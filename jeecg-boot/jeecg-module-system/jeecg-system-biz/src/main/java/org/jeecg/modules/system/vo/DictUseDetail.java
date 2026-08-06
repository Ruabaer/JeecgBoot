package org.jeecg.modules.system.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 字典使用明细 VO
 */
@Data
public class DictUseDetail implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 模块类型（系统实体 / Online表单 / Online报表）
     */
    private String type;

    /**
     * 表名 / 实体类名
     */
    private String tableName;

    /**
     * 模块/业务名称
     */
    private String tableTxt;

    /**
     * 字段属性名
     */
    private String fieldName;

    /**
     * 字段中文说明
     */
    private String fieldTxt;

    /**
     * 模块说明 / 描述
     */
    private String moduleRemark;
}
