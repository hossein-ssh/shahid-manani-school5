@echo off
chcp 65001 >nul
echo ========================================================
echo   سامانه هوشمند دبیرستان و مؤسسه آموزشی اندیشه ساری
echo   Andisheh Sari Educational Management System
echo   نصب وابستگی‌ها / Installing Dependencies...
echo ========================================================
echo.

node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [خطا] نرم‌افزار Node.js روی سیستم شما یافت نشد!
    echo لطفاً Node.js نسخه 20 یا بالاتر را از وبسایت https://nodejs.org دانلود و نصب نمایید.
    pause
    exit /b 1
)

echo در حال نصب پکیج‌های پروژه با npm...
echo Installing packages via npm...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [موفقیت] کلیه وابستگی‌ها با موفقیت نصب شدند!
    echo اکنون می‌توانید با اجرای فایل start.bat پروژه را اجرا کنید.
    echo ========================================================
) else (
    echo.
    echo [خطا] در فرآیند نصب پکیج‌ها خطایی رخ داد!
)

pause
