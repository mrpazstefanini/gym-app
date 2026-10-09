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
remoteAndroidBuildPreview: # to generate android apk
	$$message = Read-Host "Enter expo message"; `
	Write-Host "Building the project remotely..."; `
	eas build --platform android --profile preview --message "$$message"

setNote20:
	@echo "Setting Node.js version to 20..."
	@setNode20

remoteBuildProduction:
	@$$message = Read-Host "Enter expo message"; \
	echo "Building the project remotely..."; \
	eas build -p android --profile production --message "$$message"

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
	@make tunnel
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
	
reset:
	@make clean
	@npm install --legacy-peer-deps --force

logProduction:
	@echo "Log production"
	@adb logcat *:S ReactNativeJS:V

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
	@npx expo prebuild

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
