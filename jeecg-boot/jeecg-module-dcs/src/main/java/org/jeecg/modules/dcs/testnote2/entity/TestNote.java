package org.jeecg.modules.dcs.testnote2.entity;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.math.BigDecimal;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import org.jeecg.common.constant.ProvinceCityArea;
import org.jeecg.common.util.SpringContextUtils;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecg.common.aspect.annotation.Dict;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 请假单@JS增强示例
 * @Author: jeecg-boot
 * @Date:   2026-07-05
 * @Version: V1.0
 */
@Data
@TableName("test_note")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description="请假单@JS增强示例")
public class TestNote implements Serializable {
    private static final long serialVersionUID = 1L;

	/**主键*/
	@TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "主键")
    private java.lang.String id;
	/**用户名*/
	@Excel(name = "用户名", width = 15)
    @Schema(description = "用户名")
    private java.lang.String name;
	/**年龄*/
	@Excel(name = "年龄", width = 15)
    @Schema(description = "年龄")
    private java.lang.Integer age;
	/**性别*/
	@Excel(name = "性别", width = 15, dicCode = "sex")
	@Dict(dicCode = "sex")
    @Schema(description = "性别")
    private java.lang.String sex;
	/**生日*/
	@Excel(name = "生日", width = 15, format = "yyyy-MM-dd")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @Schema(description = "生日")
    private java.util.Date birthday;
	/**所属部门*/
    @Schema(description = "所属部门")
    private java.lang.String sysOrgCode;
	/**请假原因*/
	@Excel(name = "请假原因", width = 15)
    @Schema(description = "请假原因")
    private java.lang.String contents;
	/**创建人*/
    @Schema(description = "创建人")
    private java.lang.String createBy;
	/**创建日期*/
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @Schema(description = "创建日期")
    private java.util.Date createTime;
	/**更新人*/
    @Schema(description = "更新人")
    private java.lang.String updateBy;
	/**更新日期*/
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @Schema(description = "更新日期")
    private java.util.Date updateTime;
	/**地区*/
    @Excel(name = "地区", width = 15,exportConvert=true,importConvert = true )
    @Schema(description = "地区")
    private java.lang.String sheng;

    public String convertisSheng() {
        return SpringContextUtils.getBean(ProvinceCityArea.class).getText(sheng);
    }

    public void convertsetSheng(String text) {
        this.sheng = SpringContextUtils.getBean(ProvinceCityArea.class).getCode(text);
    }
	/**年*/
	@Excel(name = "年", width = 15, format = "yyyy-MM-dd")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @Schema(description = "年")
    private java.util.Date year;
	/**月*/
	@Excel(name = "月", width = 15, format = "yyyy-MM-dd")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @Schema(description = "月")
    private java.util.Date month;
}
