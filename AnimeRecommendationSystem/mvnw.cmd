@echo off
rem ============================================================================
rem Anime Recommendation System - Maven Runner Helper for Windows
rem Auto-detects Maven from PATH or IntelliJ IDEA installation
rem ============================================================================

setlocal enabledelayedexpansion

rem 1. Check if 'mvn' is directly accessible in PATH
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Using Maven found in system PATH...
    call mvn %*
    exit /b %ERRORLEVEL%
)

rem 2. Check IntelliJ IDEA bundled Maven
set "IDEA_MAVEN=C:\Program Files\JetBrains\IntelliJ IDEA 2026.2\plugins\maven-plugin\lib\maven3\bin\mvn.cmd"
if exist "%IDEA_MAVEN%" (
    echo [INFO] Using Maven bundled with IntelliJ IDEA...
    call "%IDEA_MAVEN%" %*
    exit /b %ERRORLEVEL%
)

rem 3. Search for any other JetBrains Maven in Program Files
for /d %%D in ("C:\Program Files\JetBrains\IntelliJ*") do (
    if exist "%%D\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" (
        echo [INFO] Using Maven found in %%D...
        call "%%D\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" %*
        exit /b %ERRORLEVEL%
    )
)

echo.
echo [ERROR] Maven was not found on your system PATH or in JetBrains plugins.
echo.
echo Please do one of the following:
echo 1. Download Apache Maven from https://maven.apache.org/download.cgi
echo    Extract the zip and add its 'bin' directory to your Windows System PATH.
echo 2. Or open this project directly in IntelliJ IDEA or Eclipse and click Run.
echo.
exit /b 1
