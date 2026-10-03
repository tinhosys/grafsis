@echo off
echo Iniciando GRAFSIS em http://localhost:5050/ ...
start "" "http://localhost:5050/"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
