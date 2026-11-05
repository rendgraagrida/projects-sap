@echo off
setlocal
title SAP Mastery Lab (MM - PS - FI)
cd /d "D:\DEVELOPMENT\projects-sap"

echo ======================================================================
echo           🚀 SAP MASTERY LAB (MM - PS - FI) LAUNCHER
echo ======================================================================
echo.
echo [1/2] Memeriksa status dependensi...
if not exist "node_modules" (
    echo   - Menginstall dependensi dengan Bun...
    call bun install
)

echo [2/2] Menyalakan server Vite dan membuka browser...
echo.
echo Dashboard Web: http://127.0.0.1:5173/
echo Tips: Tekan Ctrl+C untuk menghentikan server.
echo ======================================================================
echo.

:: Membuka browser otomatis setelah 2 detik
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:5173/'"

:: Menjalankan Vite dev server
call bun run dev

pause
