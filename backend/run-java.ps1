$javaBin = "C:\Program Files\Java\jdk-27\bin\java.exe"
$binDir = Join-Path $PSScriptRoot "bin"

if (Test-Path $javaBin) {
    & $javaBin -cp $binDir com.edtech.crm.standalone.JavaCrmServer
} else {
    java -cp $binDir com.edtech.crm.standalone.JavaCrmServer
}
