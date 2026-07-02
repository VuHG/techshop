@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo    TechShop - Tu dong cai dat va chay
echo ============================================
echo.

REM 1) Kiem tra Docker da chay chua
docker version >nul 2>&1
if errorlevel 1 (
  echo [LOI] Docker chua chay.
  echo Hay CAI va MO Docker Desktop, doi no khoi dong xong roi chay lai file nay.
  echo Tai Docker: https://www.docker.com/products/docker-desktop
  echo.
  pause
  exit /b 1
)

REM 2) Chon lenh compose (ban moi v2 hoac ban cu v1)
set "COMPOSE=docker compose"
docker compose version >nul 2>&1
if errorlevel 1 set "COMPOSE=docker-compose"

REM 3) Tao file .env neu chua co
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Da tao file .env tu .env.example.
)

REM 4) Nhac dien GEMINI_API_KEY neu con la placeholder
findstr /C:"your_gemini_api_key_here" ".env" >nul
if not errorlevel 1 (
  echo.
  echo [CHU Y] Ban chua dien GEMINI_API_KEY ^(khoa cho chatbot AI^).
  echo Notepad se mo file .env: thay "your_gemini_api_key_here" bang API key that,
  echo roi LUU ^(Ctrl+S^) va DONG Notepad de tiep tuc.
  echo   Lay key mien phi tai: https://aistudio.google.com/app/apikey
  echo   ^(Neu bo qua, phan ban hang van chay, chi chatbot khong hoat dong^)
  echo.
  pause
  notepad .env
)

REM 5) Build va khoi dong
echo.
echo Dang build va khoi dong... (lan dau co the mat vai phut, can Internet)
%COMPOSE% up -d --build
if errorlevel 1 (
  echo.
  echo [LOI] Build/khoi dong that bai. Xem thong bao loi phia tren.
  pause
  exit /b 1
)

echo.
echo ============================================
echo    HOAN TAT!
echo    Mo trinh duyet: http://localhost:3000
echo    Admin: 0999999999  /  Admin@123
echo ============================================
echo.
%COMPOSE% ps
echo.
echo (De DUNG he thong sau nay: chay file "dung.bat" hoac lenh "%COMPOSE% down")
pause
