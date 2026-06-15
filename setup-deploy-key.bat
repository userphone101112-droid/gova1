@echo off
REM Deploy Key Setup Script for gova1
REM This script sets up the deploy key for SSH authentication with GitHub

setlocal enabledelayedexpansion

set "projectRoot=%~dp0"
set "keyPath=%projectRoot%.git_deploy_key"
set "sshLocalPath=%USERPROFILE%\.ssh_local\gova1"

echo.
echo ========================================
echo Deploy Key Setup - gova1
echo ========================================
echo.

if "%1"=="" goto :usage
if "%1"=="--help" goto :help
if "%1"=="/?" goto :help
if "%1"=="setup" goto :setup
if "%1"=="test" goto :test

goto :usage

:setup
echo [*] Creating SSH local directory...
if not exist "%sshLocalPath%" (
    mkdir "%sshLocalPath%"
    echo [+] Created directory: %sshLocalPath%
) else (
    echo [+] Directory already exists
)

echo [*] Copying keys...
copy "%keyPath%" "%sshLocalPath%\" >nul
copy "%keyPath%.pub" "%sshLocalPath%\" >nul
echo [+] Keys copied successfully

echo [*] Starting SSH Agent...
net start ssh-agent >nul 2>&1
if %errorlevel% equ 0 (
    echo [+] SSH Agent started
) else (
    echo [-] SSH Agent might already be running
)

echo [*] Adding key to SSH Agent...
ssh-add "%sshLocalPath%\.git_deploy_key" >nul 2>&1
if %errorlevel% equ 0 (
    echo [+] Key added to SSH Agent
) else (
    echo [-] Could not add key automatically
)

echo.
echo [+] Setup completed!
echo [*] Next steps:
echo    1. Add the public key to GitHub Deploy Keys:
echo       https://github.com/userphone101112-droid/gova1/settings/keys
echo    2. Copy the content from DEPLOY_KEY_SETUP.md
echo    3. Make sure to enable 'Allow write access'
echo.
goto :end

:test
echo [*] Testing SSH connection...
ssh -T git@github.com-gova1
if %errorlevel% equ 0 (
    echo [+] Connection successful!
) else (
    echo [-] Connection failed
    echo [!] Check if you added the public key to GitHub Deploy Keys
)
goto :end

:help
echo Deploy Key Setup Script
echo.
echo Usage: setup-deploy-key.bat [command]
echo.
echo Commands:
echo   setup    - Setup and install deploy keys
echo   test     - Test SSH connection with GitHub
echo   --help   - Show this help message
echo.
goto :end

:usage
echo Usage: setup-deploy-key.bat [command]
echo Try: setup-deploy-key.bat --help
goto :end

:end
echo.
pause
