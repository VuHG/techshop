@echo off
setlocal
cd /d "%~dp0"
set "COMPOSE=docker compose"
docker compose version >nul 2>&1
if errorlevel 1 set "COMPOSE=docker-compose"
echo Dang dung TechShop (du lieu VAN duoc giu lai)...
%COMPOSE% down
echo Da dung. Chay lai bang file "chay.bat".
pause
