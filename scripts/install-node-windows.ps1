<#
PowerShell helper to install Node.js (Windows).
This script tries to use Chocolatey if available, otherwise prints manual steps.
Run as Administrator if you want automated installation.
#>

Write-Host "Node installer helper for Windows\n" -ForegroundColor Cyan

function Has-Command($name) { return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null }

if (Has-Command choco) {
  Write-Host "Chocolatey detected — installing Node LTS via choco..." -ForegroundColor Green
  choco install nodejs-lts -y
  Write-Host "Please restart your terminal after install and run: npm -v" -ForegroundColor Yellow
  exit 0
}

Write-Host "Chocolatey not found. To install Node.js, either:" -ForegroundColor Yellow
Write-Host "1) Install Chocolatey (run as Administrator):`\nSet-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))`" -ForegroundColor White
Write-Host "2) Or download Node.js LTS installer from https://nodejs.org and run it." -ForegroundColor White

Write-Host "After installing Node, open a new terminal and run:`npm install` then `npm start`" -ForegroundColor Cyan
