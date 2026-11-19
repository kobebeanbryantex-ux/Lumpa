param([int]$FromX,[int]$FromY,[int]$ToX,[int]$ToY,[int]$ExpectedPid,[string]$Screenshot,[int]$X,[int]$Y,[int]$Width,[int]$Height)
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class LumpaQaInput {
 [StructLayout(LayoutKind.Sequential)] public struct Point { public int X; public int Y; }
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern bool GetCursorPos(out Point point);
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
 [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int key);
 [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(Point point);
 [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr window,uint flags);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr window,System.Text.StringBuilder text,int count);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr window,out uint process);
 [DllImport("user32.dll")] public static extern void mouse_event(uint flags,uint dx,uint dy,uint data,UIntPtr info);
}
'@
[void][LumpaQaInput]::SetProcessDPIAware()
[void][LumpaQaInput]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
function Test-LumpaOwnedProcess([uint32]$Candidate,[uint32]$Owner) {
 for($depth=0;$depth -lt 8 -and $Candidate;$depth++) {
  if($Candidate -eq $Owner){return $true}
  $process=Get-CimInstance Win32_Process -Filter "ProcessId=$Candidate" -ErrorAction SilentlyContinue
  if(!$process){return $false}
  $Candidate=$process.ParentProcessId
 }
 return $false
}
if ($Screenshot) {
 Add-Type -AssemblyName System.Drawing
 $bitmap=[System.Drawing.Bitmap]::new($Width,$Height)
 $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
 try { $graphics.CopyFromScreen($X,$Y,0,0,$bitmap.Size); $bitmap.Save($Screenshot,[System.Drawing.Imaging.ImageFormat]::Png) }
 finally { $graphics.Dispose(); $bitmap.Dispose() }
} else {
 $saved=[LumpaQaInput+Point]::new()
 [void][LumpaQaInput]::GetCursorPos([ref]$saved)
 try {
  $cursorSet=[LumpaQaInput]::SetCursorPos($FromX,$FromY)
  $cursorActual=[LumpaQaInput+Point]::new();[void][LumpaQaInput]::GetCursorPos([ref]$cursorActual)
  Write-Output ("cursor set="+$cursorSet+" requested="+$FromX+","+$FromY+" actual="+$cursorActual.X+","+$cursorActual.Y)
  $hitPoint=[LumpaQaInput+Point]::new();$hitPoint.X=$FromX;$hitPoint.Y=$FromY
  $hitWindow=[LumpaQaInput]::WindowFromPoint($hitPoint)
  $hitRoot=[LumpaQaInput]::GetAncestor($hitWindow,2)
  $hitProcess=[uint32]0
  [void][LumpaQaInput]::GetWindowThreadProcessId($hitRoot,[ref]$hitProcess)
  $hitDeadline=[DateTime]::UtcNow.AddSeconds(12)
  while($ExpectedPid -and !(Test-LumpaOwnedProcess $hitProcess $ExpectedPid) -and [DateTime]::UtcNow -lt $hitDeadline) {
   Start-Sleep -Milliseconds 100
   $hitRoot=[LumpaQaInput]::GetAncestor([LumpaQaInput]::WindowFromPoint($hitPoint),2)
   [void][LumpaQaInput]::GetWindowThreadProcessId($hitRoot,[ref]$hitProcess)
  }
  $hitTitle=[System.Text.StringBuilder]::new(256)
  [void][LumpaQaInput]::GetWindowText($hitRoot,$hitTitle,256)
  Write-Output ("target " + $hitTitle.ToString() + " hwnd="+$hitWindow+" root="+$hitRoot+" pid=" + $hitProcess + " expected=" + $ExpectedPid)
  if($ExpectedPid -and !(Test-LumpaOwnedProcess $hitProcess $ExpectedPid)) {throw 'The physical pointer target is not the test app.'}
  [LumpaQaInput]::mouse_event(2,0,0,0,[UIntPtr]::Zero)
  Write-Output ("press " + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + " held=" + [LumpaQaInput]::GetAsyncKeyState(1))
  Start-Sleep -Milliseconds 180
  for($step=1;$step -le 25;$step++) {
   [void][LumpaQaInput]::SetCursorPos([int]($FromX+($ToX-$FromX)*$step/25),[int]($FromY+($ToY-$FromY)*$step/25))
   Start-Sleep -Milliseconds 32
  }
 } finally {
  [LumpaQaInput]::mouse_event(4,0,0,0,[UIntPtr]::Zero)
  Write-Output ("release " + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  [void][LumpaQaInput]::SetCursorPos($saved.X,$saved.Y)
 }
}
