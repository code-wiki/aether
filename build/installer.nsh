; Custom NSIS installer script for Aether

!macro customHeader
  !system "echo Preparing Aether installer..."
!macroend

!macro customInit
  ; Check if previous version is running
  !insertmacro APP_ASSOCIATE "aether-chat" "Aether.ChatExport" "Aether Chat Export" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0
!macroend

!macro customInstall
  ; Add custom installation steps here if needed
  WriteRegStr HKCU "Software\Aether" "InstallPath" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Add custom uninstallation steps here
  DeleteRegKey HKCU "Software\Aether"
!macroend
