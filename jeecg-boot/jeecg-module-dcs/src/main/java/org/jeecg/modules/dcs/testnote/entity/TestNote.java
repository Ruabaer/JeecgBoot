package org.jeecg.modules.dcs.testnote.entity;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.math.BigDecimal;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecg.common.aspect.annotation.Dict;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 璇峰亣鍗旲JS澧炲己绀轰緥
 * @Author: jeecg-boot
 * @Date:   2026-07-04
 * @Version: V1.0
 */
@Data
@TableName("test_note")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="test_note瀵硅薄", description="璇峰亣鍗旲JS澧炲己绀轰緥")
public class TestNote implements Serializable {
    private static final long serialVersionUID = 1L;

	/**涓婚敭*/
	@TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "涓婚敭")
    private java.lang.String id;
	/**鍒涘缓浜?/
    @ApiModelProperty(value = "鍒涘缓浜?)
    private java.lang.String createBy;
	/**鍒涘缓鏃ユ湡*/
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "鍒涘缓鏃ユ湡")
    private java.util.Date createTime;
	/**鏇存柊浜?/
    @ApiModelProperty(value = "鏇存柊浜?)
    private java.lang.String updateBy;
	/**鏇存柊鏃ユ湡*/
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "鏇存柊鏃ユ湡")
    private java.util.Date updateTime;
	/**鎵€灞為儴闂?/
    @ApiModelProperty(value = "鎵€灞為儴闂?)
    private java.lang.String sysOrgCode;
	/**鐢ㄦ埛鍚?/
	@Excel(name = "鐢ㄦ埛鍚?, width = 15)
    @ApiModelProperty(value = "鐢ㄦ埛鍚?)
    private java.lang.String name;
	/**骞撮緞*/
	@Excel(name = "骞撮緞", width = 15)
    @ApiModelProperty(value = "骞撮緞")
    private java.lang.Integer age;
	/**鎬у埆*/
	@Excel(name = "鎬у埆", width = 15, dicCode = "sex")
	@Dict(dicCode = "sex")
    @ApiModelProperty(value = "鎬у埆")
    private java.lang.String sex;
	/**鐢熸棩*/
	@Excel(name = "鐢熸棩", width = 15, format = "yyyy-MM-dd")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @ApiModelProperty(value = "鐢熸棩")
    private java.util.Date birthday;
	/**璇峰亣鍘熷洜*/
	@Excel(name = "璇峰亣鍘熷洜", width = 15)
    @ApiModelProperty(value = "璇峰亣鍘熷洜")
    private java.lang.String contents;
	/**鍦板尯*/
	@Excel(name = "鍦板尯", width = 15)
    @ApiModelProperty(value = "鍦板尯")
    private java.lang.String sheng;
	/**骞?/
	@Excel(name = "骞?, width = 15, format = "yyyy-MM-dd")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @ApiModelProperty(value = "骞?)
    private java.util.Date year;
	/**鏈?/
	@Excel(name = "鏈?, width = 15, format = "yyyy-MM-dd")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @ApiModelProperty(value = "鏈?)
    private java.util.Date month;
}

