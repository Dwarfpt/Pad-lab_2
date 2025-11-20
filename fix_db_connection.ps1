# Скрипт для отключения подключения к БД в тестовом окружении

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
    $path = "services/$service/src/server.ts"
    if (Test-Path $path) {
        Write-Host "Updating $path..." -ForegroundColor Cyan
        $content = Get-Content $path -Raw
        
        # Ищем строку connectDB(); и заменяем её на условный блок
        if ($content -match "connectDB\(\);") {
            $newContent = $content -replace "connectDB\(\);", "if (process.env.NODE_ENV !== 'test') { connectDB(); }"
            Set-Content -Path $path -Value $newContent
            Write-Host "Updated connectDB call in $service" -ForegroundColor Green
        } else {
            Write-Host "connectDB() call not found in $service" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Warning: $path not found!" -ForegroundColor Yellow
    }
}

Write-Host "All server.ts files updated!" -ForegroundColor Green
