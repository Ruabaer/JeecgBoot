@echo off
:: Set console code page to UTF-8 to prevent log encoding issues
chcp 65001 > nul

echo ==========================================================
echo [INFO] Preparing to start Jeecg DCS microservice...
echo ==========================================================

:: Change to target directory relative to this script
cd /d "%~dp0jeecg-boot\jeecg-server-cloud\jeecg-dcs-cloud-start\target"

echo [INFO] Current directory: %cd%
echo [INFO] Launching java process...
echo ----------------------------------------------------------

java "-Dfile.encoding=utf-8" -jar jeecg-dcs-cloud-start-3.7.4.jar --spring.profiles.active=dev,SpringCloud --spring.cloud.nacos.config.server-addr=127.0.0.1:8848 --spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848

echo ----------------------------------------------------------
echo [WARNING] Service has terminated!
pause
