@echo off
:: Set console code page to UTF-8 to prevent log encoding issues
chcp 65001 > nul

echo ==========================================================
echo [INFO] Preparing to start Jeecg System microservice...
echo ==========================================================

:: Change to target directory relative to this script
cd /d "%~dp0jeecg-boot\jeecg-server-cloud\jeecg-system-cloud-start\target"

echo [INFO] Current directory: %cd%
echo [INFO] Launching java process...
echo ----------------------------------------------------------

java "-Dfile.encoding=utf-8" -jar jeecg-system-cloud-start-3.7.4.jar --spring.profiles.active=dev,SpringCloud

echo ----------------------------------------------------------
echo [WARNING] Service has terminated!
pause
