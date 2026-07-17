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

:: Find jar file using wildcard to avoid hardcoded version
set JAR_FILE=
for %%f in (jeecg-system-cloud-start-*.jar) do (
    set "JAR_FILE=%%f"
)

if "%JAR_FILE%"=="" (
    echo [ERROR] No jeecg-system-cloud-start-*.jar file found in target directory!
    pause
    exit /b 1
)

echo [INFO] Found target JAR: %JAR_FILE%
java "-Dfile.encoding=utf-8" -jar "%JAR_FILE%" --spring.profiles.active=dev,SpringCloud

echo ----------------------------------------------------------
echo [WARNING] Service has terminated!
pause
