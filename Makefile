SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -Command

############################################################################### Main
help:
	@cls
	@echo ""
	@echo "___________.__  __                                 _____ __________.___ "
	@echo "\_   _____/|__|/  |_  ____   ____   ______ ______ /  _  \\______   \   |"
	@echo " |    __)  |  \   __\/    \_/ __ \ /  ___//  ___//  /_\  \|     ___/   |"
	@echo " |     \   |  ||  | |   |  \  ___/ \___ \ \___ \/    |    \    |   |   |"
	@echo " \___  /   |__||__| |___|  /\___  >____  >____  >____|__  /____|   |___|"
	@echo "     \/                  \/     \/     \/     \/        \/              "
	@echo ""	
	@type $(MAKEFILE_LIST) | findstr /R "^[a-zA-Z_-]*:.*"

############################################################################### Project support
remoteAndroidBuildAPK: # make remoteAndroidBuildAPK message="something"
	@echo "Building the project remotely..."
	@npx eas-cli build -p android --profile preview --message "$(message)"

setNote20:
	@echo "Setting Node.js version to 20..."
	@setNode20

remoteBuildAAB: # make remoteBuildAAB message="something"
	@echo "Building the project remotely..."
	@set NODE_ENV=production; npx eas-cli build -p android --profile production --message "$(message)"


	

buildProduction:
	@echo "Building the project locally..."
	@npm run build:prod

buildDevelopment:
	@echo "Building the project locally..."
	@npm run build:dev

buildPreview:
	@echo "Building the project locally..."
	@npm run build:preview
	
dev:
	@echo " Configurando ADB tunnel..."
	@adb reverse tcp:8081 tcp:8081
	@adb reverse tcp:8082 tcp:8082
	@adb reverse tcp:19000 tcp:19000
	@adb reverse tcp:19001 tcp:19001
	@echo " Compilando e instalando..."
	@npx expo run:android --localhost

start:
	@echo " Configurando ADB tunnel..."
	@adb reverse tcp:8081 tcp:8081
	@adb reverse tcp:8082 tcp:8082
	@adb reverse tcp:19000 tcp:19000
	@adb reverse tcp:19001 tcp:19001
	@echo " Tunnel ativo"
	@echo " Iniciando Metro..."
	@npx expo start --dev-client --localhost

tunnel:
	@adb reverse tcp:8081 tcp:8081
	@adb reverse tcp:8082 tcp:8082
	@adb reverse tcp:19000 tcp:19000
	@adb reverse tcp:19001 tcp:19001
	@echo " Portas redirecionadas:"
	@adb reverse --list
	
devices:
	@adb devices

expoDoctor: # npx expo doctor
	@npx expo doctor

reactNativeDoctor: # npx react-native doctor
	@npx react-native doctor

runExpoGo:
	@npx expo start --tunnel

devRunReset:
	@npx expo start --tunnel --reset-cache

commit:
	@$$message = Read-Host "Enter commit message"; \
	git add .; \
	git commit -m "$$message"; \
	git push origin main

startDocker:
	@docker-compose up -d

killPort:
	@netstat -ano | findstr :3000	
	@for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F

format:
	@npm run format

clean:
	@if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
	@if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }

cleanAndroid: 
	@Remove-Item -Recurse -Force android\.gradle
	@Remove-Item -Recurse -Force android\app\.cxx
	@Remove-Item -Recurse -Force android\app\build
	@Remove-Item -Recurse -Force android\build
	
reset: # @Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
	@make clean
	@npm install --legacy-peer-deps --force

logProduction:
	@echo "Log production"
	@adb logcat -v time AndroidRuntime:E ReactNativeJS:V ExpoModulesCore:V *:S

logErrorsByPackage:
	@adb logcat *:E | findstr /i "com.gymapp.android"

adbReset:
	@echo "Reset ADB"
	@adb kill-server; adb start-server

adbList:
	@echo "List ADB devices"
	@adb devices

logError:
	@echo "Log error"
	@adb logcat *:E | findstr /i "fatal exception error"

prebuild:
	@echo ">>> [1/6] Closing VS Code to release file locks..."
	@taskkill /F /IM Code.exe 2>$$null; exit 0
	@echo ">>> [2/6] Stopping Gradle daemons..."
	@if (Test-Path android) { Push-Location android; .\gradlew --stop 2>$$null; Pop-Location }
	@echo ">>> [3/6] Removing stale Android build artifacts..."
	@if (Test-Path android\.gradle)   { Remove-Item -Recurse -Force android\.gradle }
	@if (Test-Path android\app\.cxx)  { Remove-Item -Recurse -Force android\app\.cxx }
	@if (Test-Path android\app\build) { Remove-Item -Recurse -Force android\app\build }
	@if (Test-Path android\build)     { Remove-Item -Recurse -Force android\build }
	@if (Test-Path android)           { Remove-Item -Recurse -Force android }
	@if (Test-Path ios)               { Remove-Item -Recurse -Force ios }
	@echo ">>> [4/6] Removing corrupted Gradle global caches..."
	@if (Test-Path "$$env:USERPROFILE\.gradle\caches\8.14.3") { Remove-Item -Recurse -Force "$$env:USERPROFILE\.gradle\caches\8.14.3" }
	@if (Test-Path "$$env:USERPROFILE\.gradle\kotlin-dsl")    { Remove-Item -Recurse -Force "$$env:USERPROFILE\.gradle\kotlin-dsl" }
	@if (Test-Path "$$env:USERPROFILE\.gradle\daemon")        { Remove-Item -Recurse -Force "$$env:USERPROFILE\.gradle\daemon" }
	@echo ">>> [5/6] Running expo prebuild..."
	@$$env:NODE_ENV = "production"; $$env:USE_LOCAL_ENV_FILE = "1"; npx expo prebuild --platform android --clean
	@echo ">>> [6/6] Done! Re-open VS Code manually: code ."
	@echo ""
	@echo " Next steps:"
	@echo " make dev - run on connected device"
	@echo " make start - start Metro bundler"
	@echo ""

build:
	@bash build-apk.bat

forceCloseEmulator:
	@echo "Force close emulator"
	@taskkill /F /IM qemu-system-x86_64.exe

removeAndroidFolder:
	@if (Test-Path android\.gradle) { Remove-Item -Recurse -Force android\.gradle }

startOnDevice:
	@adb reverse tcp:8081 tcp:8081;
	@adb reverse tcp:8097 tcp:8097;
	@set REACT_NATIVE_PACKAGER_HOSTNAME=localhost;
	@npx expo start --dev-client --localhost --reset-cache

removeAndroid:
	@powershell -Command "Set-Location android; if (Test-Path .gradle) { Remove-Item .gradle -Recurse -Force }; if (Test-Path build) { Remove-Item build -Recurse -Force }; if (Test-Path app\build) { Remove-Item app\build -Recurse -Force }"

clean-all:
	@powershell -Command "taskkill /F /IM node.exe 2>$$null; exit 0"
	@npm cache clean --force
	@powershell -Command "if (Test-Path node_modules) { Remove-Item node_modules -Recurse -Force }"
	@$(MAKE) removeAndroid
	@npm install

build-dev: 
	@Remove-Item -Recurse -Force android\app\build;
	@Remove-Item -Recurse -Force android\build;
	@reset;
	@./build-apk.bat

get-production-credentials:
	@npx eas-cli credentials --platform android

get-development-credentials:
	@cd android; ./gradlew signingReport