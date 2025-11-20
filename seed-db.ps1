# Скрипт для заполнения базы данных начальными данными

Write-Host "⏳ Запуск скрипта заполнения базы данных..." -ForegroundColor Yellow

# Запускаем seed скрипт внутри контейнера parking-service
# Используем parking-service, так как там есть все модели и скрипт seedData.ts
docker-compose exec -T parking-service npm run seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ База данных успешно заполнена!" -ForegroundColor Green
    Write-Host "📧 Админ: admin@smartparking.com" -ForegroundColor Cyan
    Write-Host "🔑 Пароль: admin123" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Ошибка при заполнении базы данных." -ForegroundColor Red
}
