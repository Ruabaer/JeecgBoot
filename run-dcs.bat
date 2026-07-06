@echo off
:: 设置终端字符集编码为 UTF-8，防止控制台中文日志出现乱码
chcp 65001 > nul

echo ==========================================================
echo [INFO] 正在准备启动 Jeecg DCS 微服务...
echo ==========================================================

:: 切换到 jar 包所在的 target 目录 (%~dp0 表示当前批处理文件所在的根目录)
cd /d "%~dp0jeecg-boot\jeecg-server-cloud\jeecg-dcs-cloud-start\target"

echo [INFO] 当前运行目录: %cd%
echo [INFO] 执行启动命令中...
echo ----------------------------------------------------------

java "-Dfile.encoding=utf-8" -jar jeecg-dcs-cloud-start-3.7.4.jar --spring.profiles.active=dev,SpringCloud --spring.cloud.nacos.config.server-addr=127.0.0.1:8848 --spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848

echo ----------------------------------------------------------
echo [WARNING] 服务已退出！
pause
