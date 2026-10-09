!macro NSIS_HOOK_PREUNINSTALL
  ${If} $UpdateMode <> 1
  ${AndIf} $DeleteAppDataCheckboxState = ${BST_CHECKED}
    ExecWait '"$INSTDIR\${MAINBINARYNAME}.exe" --purge-user-data' $0
    ${If} $0 <> 0
      MessageBox MB_ICONSTOP|MB_OK "Lumpa could not securely remove its local vault and Windows credential. The uninstall has been stopped so you can retry."
      Abort
    ${EndIf}
  ${EndIf}
!macroend
