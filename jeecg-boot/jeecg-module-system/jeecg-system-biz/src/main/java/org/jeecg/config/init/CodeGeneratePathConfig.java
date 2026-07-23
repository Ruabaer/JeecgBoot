package org.jeecg.config.init;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.File;

/**
 * @Description: 代码生成器路径动态配置类
 * 优先读取 application.yml / 环境变量 / .env 配置，如未配置则根据当前项目运行目录动态计算，避免硬编码
 * @author: JeecgBoot
 */
@Slf4j
@Configuration
public class CodeGeneratePathConfig {

    @Value("${jeecg.path.project-path:}")
    private String projectPath;

    @Value("${jeecg.path.ui-project-path:}")
    private String uiProjectPath;

    @PostConstruct
    public void initPathConfig() {
        // 1. 如果没有配置后台项目路径，则动态计算当前目录
        if (StringUtils.isBlank(projectPath)) {
            String userDir = System.getProperty("user.dir");
            File file = new File(userDir);
            if ("jeecg-system-cloud-start".equals(file.getName()) || "jeecg-system-start".equals(file.getName())) {
                File parent = file.getParentFile();
                if (parent != null && parent.getParentFile() != null) {
                    file = parent.getParentFile();
                }
            }
            projectPath = file.getAbsolutePath();
            File dcsDir = new File(file, "jeecg-module-dcs");
            if (dcsDir.exists()) {
                projectPath = dcsDir.getAbsolutePath();
            }
        }

        // 2. 如果没有配置前端项目路径，则自动推导同级的 jeecgboot-vue3 目录
        if (StringUtils.isBlank(uiProjectPath)) {
            File currentDir = new File(projectPath);
            File parentDir = currentDir.getParentFile();
            if (parentDir != null) {
                File vue3Dir = new File(parentDir, "jeecgboot-vue3");
                if (vue3Dir.exists()) {
                    uiProjectPath = vue3Dir.getAbsolutePath();
                } else {
                    uiProjectPath = new File(currentDir, "jeecgboot-vue3").getAbsolutePath();
                }
            }
        }

        // 3. 设置系统属性供代码生成器使用
        String currentDate = new java.text.SimpleDateFormat("yyyyMMdd").format(new java.util.Date());
        System.setProperty("currentDate", currentDate);
        System.setProperty("project_path", projectPath);
        System.setProperty("ui_project_path", uiProjectPath);

        // 4. 通过反射重置 JeecgProp 内置静态 properties 属性对象
        try {
            Class<?> jeecgPropClass = Class.forName("org.jeecgframework.codegenerate.config.def.JeecgProp");
            // 反射获取 properties 静态变量
            java.lang.reflect.Field propsField = jeecgPropClass.getDeclaredField("properties");
            propsField.setAccessible(true);
            java.util.Properties props = (java.util.Properties) propsField.get(null);
            if (props != null) {
                props.setProperty("project_path", projectPath);
                props.setProperty("ui_project_path", uiProjectPath);
            }

            // 同时也设置可能存在的单例/静态字段
            java.lang.reflect.Field[] fields = jeecgPropClass.getDeclaredFields();
            for (java.lang.reflect.Field field : fields) {
                field.setAccessible(true);
                if ("project_path".equalsIgnoreCase(field.getName()) || "projectPath".equalsIgnoreCase(field.getName())) {
                    field.set(null, projectPath);
                } else if ("ui_project_path".equalsIgnoreCase(field.getName()) || "uiProjectPath".equalsIgnoreCase(field.getName())) {
                    field.set(null, uiProjectPath);
                }
            }
        } catch (Throwable t) {
            log.debug("Reflective override for JeecgProp skipped: {}", t.getMessage());
        }

        log.info(" Init CodeGenerate Path Config -> JAVA: [{}], VUE3: [{}]", projectPath, uiProjectPath);
    }
}
