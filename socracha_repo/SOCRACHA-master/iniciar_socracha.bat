@echo off
echo Iniciando SOCRACHA em http://localhost:5051/ ...
start "" "http://localhost:5051/"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"

