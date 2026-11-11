@echo off
chcp 65001 >nul
echo ========================================================
echo   سامانه هوشمند دبیرستان و مؤسسه آموزشی اندیشه ساری
echo   Andisheh Sari Educational Management System
echo   اجرای پروژه / Starting Application Server (Port 3000)...
echo ========================================================
echo.

if not exist node_modules (
    echo پوشه node_modules یافت نشد. در حال اجرای خودکار install.bat...
    call install.bat
)

if not exist .env (
    if exist .env.example (
        echo ایجاد فایل .env بر اساس .env.example...
        copy .env.example .env >nul
    )
)

echo سرور فول‌استک (Express + React Vite) در حال راه‌اندازی است...
echo آدرس دسترسی در مرورگر: http://localhost:3000
echo برای توقف سرور کلیدهای Ctrl+C را فشار دهید.
echo.
call npm run dev
