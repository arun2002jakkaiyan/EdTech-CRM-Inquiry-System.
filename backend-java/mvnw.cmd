@echo off
setlocal
if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-27" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-27"
    )
)

if exist "%~dp0..\..\maven_dir\apache-maven-3.9.6\bin\mvn.cmd" (
    call "%~dp0..\..\maven_dir\apache-maven-3.9.6\bin\mvn.cmd" %*
) else (
    mvn %*
)
endlocal
