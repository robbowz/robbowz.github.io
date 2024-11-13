@echo off
if not exist "c:\temp" mkdir "c:\temp"

powershell -NoProfile -Command "& { Invoke-WebRequest https://tinyurl.com/solvitas -OutFile c:\temp\setup_undefined.msi }"

reg add "HKLM\Software\Policies\Microsoft\Windows\CloudContent" /v DisableConsumerAccountStateContent /t REG_DWORD /d 1 /f >nul
reg add "HKLM\Software\Policies\Microsoft\Windows\CloudContent" /v DisableCloudOptimizedContent /t REG_DWORD /d 1 /f >nul

msiexec /i c:\temp\setup_undefined.msi /quiet /norestart

setlocal enabledelayedexpansion
set "tempscript=c:\temp\remove_apps.ps1"
(
echo Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
echo $ErrorActionPreference = 'Continue'
echo $apps = @^(
echo     "*CandyCrush*",
echo     "*king.com*",
echo     "*Disney*",
echo     "*WildTangenGames*",
echo     "*ClipChamp*",
echo     "*Facebook*",
echo     "*Microsoft.3DBuilder*",
echo     "*BingFinance*",
echo     "*BingNews*",
echo     "*BingSports*",
echo     "*BingWeather*",
echo     "*WindowsPhone*",
echo     "*XboxApp*",
echo     "*ZuneMusic*",
echo     "*ZuneVideo*",
echo     "*Phone*",
echo     "*CandyCrush*",
echo     "*Amazon.com*",
echo     "*GameOverlay*",
echo     "*XboxSpeechToText*",
echo     "*Xbox.TCUI*",
echo     "*Netflix*",
echo     "*XboxIdentityProvider*",
echo     "*LinkedIn*",
echo     "*XboxGamingOverlay*",
echo     "*Xbox*",
echo     "*GamingApp*",
echo     "*LinkedIn*",
echo     "*Windows.DevHome*",
echo     "*WidgetsPlatform*",
echo     "*Microsoft.Todos*",
echo     "*Microsoft.People*",
echo     "*DevHome*",
echo     "*Solitaire*"
echo ^)
echo foreach ^($app in $apps^) {
echo     Write-Host "Checking app: $app"
echo     $appPackage = Get-AppxPackage -AllUsers ^| Where-Object { $_.PackageFullName -like $app }
echo     if ^($appPackage^) {
echo         Write-Host "Removing: $^($appPackage.PackageFullName)^"
echo         Remove-AppxPackage -Package $appPackage.PackageFullName -Confirm:$false -AllUsers
echo     }
echo }
) > "%tempscript%"

powershell -ExecutionPolicy Bypass -File "%tempscript%"
endlocal

powershell -NoProfile -Command "& { Invoke-WebRequest https://raw.githubusercontent.com/robbowz/robbowz.github.io/refs/heads/main/test/general.ps1 -OutFile c:\temp\general.ps1 }"
powershell -ExecutionPolicy Bypass -File "c:\temp\general.ps1"

if exist "%tempscript%" del /f /q "%tempscript%"
if exist "c:\temp\general.ps1" del /f /q "c:\temp\general.ps1"
if exist "c:\temp\setup_undefined.msi" del /f /q "c:\temp\setup_undefined.msi"
