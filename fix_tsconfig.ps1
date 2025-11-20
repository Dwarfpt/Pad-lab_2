# Скрипт для исправления tsconfig.json во всех сервисах

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
    $path = "services/$service/tsconfig.json"
    if (Test-Path $path) {
        Write-Host "Updating $path..." -ForegroundColor Cyan
        $content = Get-Content $path -Raw
        # Заменяем "types": ["node"] на "types": ["node", "jest"]
        $newContent = $content -replace '"types": \["node"\]', '"types": ["node", "jest"]'
        Set-Content -Path $path -Value $newContent
    } else {
        Write-Host "Warning: $path not found!" -ForegroundColor Yellow
    }
}

Write-Host "All tsconfig.json files updated!" -ForegroundColor Green
