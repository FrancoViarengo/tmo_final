# Script para simular el Cron Job localmente
$envFile = ".env.local"

# Leer CRON_SECRET del archivo .env.local (forma simple)
$cronSecret = "test_secret"
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    foreach ($line in $content) {
        if ($line -match "^CRON_SECRET=(.*)") {
            $cronSecret = $matches[1]
        }
    }
}

Write-Host "Ejecutando importación diaria..." -ForegroundColor Cyan
Write-Host "Secret usado: $cronSecret" -ForegroundColor Gray

# Llamar a la API localmente
# Ejecutar 5 veces para importar 100 series (20 x 5)
for ($i = 1; $i -le 5; $i++) {
    Write-Host "Ejecutando lote $i de 5..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4001/api/cron/daily-import" -Method Get -Headers @{ "Authorization" = "Bearer $cronSecret" }
        Write-Host "¡Lote $i completado!" -ForegroundColor Green
        # $response | ConvertTo-Json -Depth 5 | Write-Host # Comentado para no saturar la terminal
    } catch {
        Write-Host "Error en el lote $i :" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
    # Pausa de seguridad de 2 segundos
    Start-Sleep -Seconds 2
}

