param(
    [string]$SqlFile,
    [string]$OutputFile,
    [string]$Database = "GRC_Assessment"
)

$ErrorActionPreference = "Stop"

try {
    $sqlcmdPath = "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\sqlcmd.exe"

    if (-not (Test-Path $sqlcmdPath)) {
        $sqlcmdPath = "C:\Program Files (x86)\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\sqlcmd.exe"
    }

    if (-not (Test-Path $sqlcmdPath)) {
        throw "sqlcmd.exe not found"
    }

    $password = 'SqlServer123!@'
    & $sqlcmdPath -S "(local)\SQLEXPRESS" -U sa -P $password -d $Database -i $SqlFile -w 500 | Out-File -Encoding ASCII -FilePath $OutputFile
    exit 0
} catch {
    Write-Host "Error: $_"
    exit 1
}
