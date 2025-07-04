#define AppVersion GetStringParam('AppVersion')
#define SourceDir GetStringParam('SourceDir')
#define OutputDir GetStringParam('OutputDir')

[Setup]
AppName=CueIT
AppVersion={#AppVersion}
DefaultDirName={pf}\CueIT
DisableProgramGroupPage=yes
OutputDir={#OutputDir}
OutputBaseFilename=CueIT-{#AppVersion}

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CueIT"; Filename: "{app}\CueIT.exe"
Name: "{userdesktop}\CueIT"; Filename: "{app}\CueIT.exe"
