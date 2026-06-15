#!/usr/bin/env pwsh
# Setup Deploy Key for gova1 Project

param(
    [switch]$Setup,
    [switch]$Test,
    [switch]$Help
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$keyPath = "$projectRoot\.git_deploy_key"
$sshLocalPath = "$env:USERPROFILE\.ssh_local\gova1"

function Show-Help {
    Write-Host @"
Deploy Key Setup Script for gova1

Usage:
    .\setup-deploy-key.ps1 [OPTIONS]

Options:
    -Setup          Install and configure keys and SSH Agent
    -Test           Test connection with GitHub
    -Help           Show this message

Examples:
    .\setup-deploy-key.ps1 -Setup
    .\setup-deploy-key.ps1 -Test
"@
}

function Setup-DeployKey {
    Write-Host "Configuring Deploy Key..." -ForegroundColor Cyan
    
    # Create SSH directory
    Write-Host "Creating SSH local directory..."
    if (-not (Test-Path $sshLocalPath)) {
        New-Item -ItemType Directory -Path $sshLocalPath -Force | Out-Null
        Write-Host "Directory created: $sshLocalPath" -ForegroundColor Green
    } else {
        Write-Host "Directory already exists" -ForegroundColor Green
    }
    
    # Copy keys
    Write-Host "Copying keys..."
    Copy-Item $keyPath "$sshLocalPath\" -Force
    Copy-Item "$keyPath.pub" "$sshLocalPath\" -Force
    Write-Host "Keys copied successfully" -ForegroundColor Green
    
    # Start SSH Agent
    Write-Host "Starting SSH Agent..."
    try {
        Start-Service ssh-agent -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Write-Host "SSH Agent ready" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not start SSH Agent" -ForegroundColor Yellow
    }
    
    # Add key to SSH Agent
    Write-Host "Adding key to SSH Agent..."
    & ssh-add "$sshLocalPath\.git_deploy_key" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Key added successfully" -ForegroundColor Green
    } else {
        Write-Host "Warning: Could not add key automatically" -ForegroundColor Yellow
    }
    
    # Update git remote
    Write-Host "`nUpdating git remote..."
    $currentRepo = git config --get remote.origin.url
    if ($currentRepo -like "*http*") {
        Write-Host "Current URL: $currentRepo"
        Write-Host "New URL: git@github.com-gova1:userphone101112-droid/gova1.git"
        git remote set-url origin "git@github.com-gova1:userphone101112-droid/gova1.git"
        Write-Host "Remote updated" -ForegroundColor Green
    }
    
    Write-Host "`nSetup completed!" -ForegroundColor Green
}

function Test-DeployKey {
    Write-Host "Testing SSH connection..." -ForegroundColor Cyan
    Write-Host "Attempting connection..."
    ssh -T git@github.com-gova1 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
        Write-Host "Connection successful!" -ForegroundColor Green
    } else {
        Write-Host "Connection failed" -ForegroundColor Red
        Write-Host "Make sure:"
        Write-Host "1. Added public key to GitHub Deploy Keys"
        Write-Host "2. Enabled 'Allow write access' on GitHub"
    }
}

# Main execution
if ($Help -or -not ($Setup -or $Test)) {
    Show-Help
} elseif ($Setup) {
    Setup-DeployKey
} elseif ($Test) {
    Test-DeployKey
}
