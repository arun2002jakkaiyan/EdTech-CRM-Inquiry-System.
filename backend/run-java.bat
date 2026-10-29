@echo off
set "JAVA_BIN=C:\Program Files\Java\jdk-27\bin"
if exist "%JAVA_BIN%\java.exe" (
    "%JAVA_BIN%\java.exe" -cp "%~dp0bin" com.edtech.crm.standalone.JavaCrmServer
) else (
    java -cp "%~dp0bin" com.edtech.crm.standalone.JavaCrmServer
)
