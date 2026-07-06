@echo off
:: Change console code page to UTF-8
chcp 65001 > nul

echo ==========================================================
echo [INFO] Starting compilation and packaging for Jeecg DCS...
echo ==========================================================

:: Change directory to the maven project folder
cd /d "%~dp0jeecg-boot"

:: Call maven to compile and package
call mvn clean package -pl jeecg-server-cloud/jeecg-dcs-cloud-start -am -Dmaven.test.skip=true -P dev,SpringCloud

echo ----------------------------------------------------------
echo [INFO] Compilation finished!
pause
