@echo off
echo ========================================
echo  Gerando APK de DESENVOLVIMENTO
echo ========================================

REM Limpar variaveis que interferem de outros projetos
set JAVA_OPTS=
set "javax.net.ssl.trustStore="
set "javax.net.ssl.trustStorePassword="
set "javax.net.ssl.trustStoreType="
set "javax.net.ssl.keyStore="
set "javax.net.ssl.keyStorePassword="

REM Define NODE_ENV
set NODE_ENV=development

REM Navegar para android
cd android

REM Limpar builds anteriores
echo Limpando builds anteriores...
call gradlew clean --no-daemon --no-build-cache
if %ERRORLEVEL% neq 0 (
    echo Erro ao executar clean!
    cd ..
    pause
    exit /b 1
)

REM Gerar APK de desenvolvimento
echo Gerando APK de desenvolvimento...
call gradlew assembleDebug --no-daemon
if %ERRORLEVEL% neq 0 (
    echo Erro ao gerar APK!
    cd ..
    pause
    exit /b 1
)

REM Verificar se foi gerado
if not exist app\build\outputs\apk\debug\app-debug.apk (
    echo Erro: APK nao foi gerado!
    cd ..
    pause
    exit /b 1
)

REM Copiar para raiz do projeto
echo Copiando APK para raiz do projeto...
copy app\build\outputs\apk\debug\app-debug.apk ..\app-dev.apk

cd ..

echo.
echo ========================================
echo  APK GERADO COM SUCESSO!
echo ========================================
echo Local: app-dev.apk
echo.
echo Para instalar no celular:
echo   adb install -r app-dev.apk
echo.
echo Depois de instalar, rode:
echo   npx expo start --dev-client
echo ========================================
pause