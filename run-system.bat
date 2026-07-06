@echo off
:: 设置终端字符集编码为 UTF-8，防止控制台中文日志出现乱码
chcp 65001 > nul

echo ==========================================================
echo [INFO] 正在准备启动 Jeecg System 系统核心微服务...
echo ==========================================================

:: 切换到 jar 包所在的 target 目录
cd /d "%~dp0jeecg-boot\jeecg-server-cloud\jeecg-system-cloud-start\target"

echo [INFO] 当前运行目录: %cd%
echo [INFO] 执行启动命令中...
echo ----------------------------------------------------------

java "-Dfile.encoding=utf-8" -jar jeecg-system-cloud-start-3.7.4.jar --spring.profiles.active=dev,SpringCloud

echo ----------------------------------------------------------
echo [WARNING] 服务已退出！
pause
