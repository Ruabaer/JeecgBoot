@echo off
:: 设置终端字符集编码为 UTF-8
chcp 65001 > nul

echo ==========================================================
echo [INFO] 开始编译打包 Jeecg System 核心微服务...
echo ==========================================================

:: 切换到项目根目录
cd /d "%~dp0"

:: 使用 call 调用 mvn 以保证编译后脚本能继续执行
call mvn clean package -pl jeecg-server-cloud/jeecg-system-cloud-start -am -Dmaven.test.skip=true -P dev,SpringCloud

echo ----------------------------------------------------------
echo [INFO] 编译完成！
pause
