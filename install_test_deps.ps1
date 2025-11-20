# Скрипт для автоматической установки зависимостей тестирования во все сервисы

Write-Host "Starting installation of test dependencies..." -ForegroundColor Green

# Frontend
Write-Host "Installing Frontend dependencies..." -ForegroundColor Cyan
Push-Location "frontend"
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @types/node
Pop-Location

# Services List
$services = @(
    "auth-service",
    "blog-service",
    "booking-service",
    "gateway",
    "parking-service",
    "payment-service",
    "support-service"
)

foreach ($service in $services) {
    Write-Host "Installing dependencies for $service..." -ForegroundColor Cyan
    Push-Location "services/$service"
    npm install
    npm install -D jest ts-jest @types/jest supertest @types/supertest @types/node
    Pop-Location
}

Write-Host "All dependencies installed successfully!" -ForegroundColor Green
Write-Host "Now you can commit and push changes to GitHub." -ForegroundColor Green
