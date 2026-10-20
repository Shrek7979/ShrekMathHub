@echo off
chcp 65001 > nul
cd /d "%~dp0"
if not exist node_modules (
  echo 처음 실행이라 필요한 도구를 설치합니다. 1~2분 걸려요...
  call npm install
)
echo Shrek Math Hub 를 켭니다. 이 창을 닫으면 사이트가 꺼져요.
start "" cmd /c "timeout /t 8 > nul && start http://localhost:3000"
npm run dev
