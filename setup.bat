@echo off
echo Starting React Environment Setup...
echo.

echo 1. Creating the Base Vite + React Project...
call npm create vite@latest frontend -- --template react

echo.
echo 2. Moving into the Project Directory...
cd frontend

echo.
echo 3. Installing Required Dependencies...
call npm install
call npm install axios lucide-react react-router-dom

echo.
echo 4. Installing and Setting up Tailwind CSS...
call npm install -D tailwindcss@3 postcss autoprefixer
call npx tailwindcss init -p

echo.
echo 5. Applying Final Tailwind Configurations...

> tailwind.config.js echo /** @type {import('tailwindcss').Config} */
>> tailwind.config.js echo export default {
>> tailwind.config.js echo   content: [
>> tailwind.config.js echo     "./index.html",
>> tailwind.config.js echo     "./src/**/*.{js,ts,jsx,tsx}",
>> tailwind.config.js echo   ],
>> tailwind.config.js echo   theme: {
>> tailwind.config.js echo     extend: {},
>> tailwind.config.js echo   },
>> tailwind.config.js echo   plugins: [],
>> tailwind.config.js echo }

> temp.css echo @tailwind base;
>> temp.css echo @tailwind components;
>> temp.css echo @tailwind utilities;
>> temp.css echo.
type src\index.css >> temp.css
move /y temp.css src\index.css >nul

echo.
echo Setup Complete! The exact skeleton frontend environment is ready.
echo You can now start the application by running:
echo cd frontend
echo npm run dev
echo.
pause
