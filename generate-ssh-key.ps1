#!/usr/bin/env pwsh
# Generate SSH Key for gova1 Deploy Key

param(
    [switch]$Help
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$keyPath = "$projectRoot\.git_deploy_key"

function Show-Help {
    Write-Host @"
Generate SSH Key Script for gova1

Usage:
    .\generate-ssh-key.ps1

This script creates a new ED25519 SSH key pair for GitHub Deploy Keys.
"@
}

function Generate-SSHKey {
    Write-Host "Generating SSH Key..." -ForegroundColor Cyan
    
    # Check if key already exists
    if (Test-Path $keyPath) {
        Write-Host "Key already exists at: $keyPath" -ForegroundColor Yellow
        Write-Host "If you want to generate a new key, delete the old one first."
        Write-Host ""
        Write-Host "Public key content (copy this to GitHub):"
        Get-Content "$keyPath.pub"
        return
    }
    
    # Get user email or use default
    $email = Read-Host "Enter your email address (for the SSH key comment)"
    if (-not $email) {
        $email = "user@example.com"
    }
    
    # Generate key
    Write-Host "Generating ED25519 SSH key..."
    ssh-keygen -t ed25519 -C $email -f $keyPath -q -N ""
    
    Write-Host "Key generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Private key: $keyPath" -ForegroundColor Cyan
    Write-Host "Public key: $keyPath.pub" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Public key content (COPY THIS TO GITHUB):" -ForegroundColor Yellow
    Write-Host "-----------------------------------------"
    Get-Content "$keyPath.pub"
    Write-Host "-----------------------------------------"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/userphone101112-droid/gova1/settings/keys"
    Write-Host "2. Add deploy key with the content above"
    Write-Host "3. Check 'Allow write access'"
    Write-Host "4. Run: .\setup-deploy-key.ps1 -Setup"
}

# Main execution
if ($Help) {
    Show-Help
} else {
    Generate-SSHKey
}
