# Script para iniciar o servidor backend
# Tenta iniciar o Signal API, mas continua mesmo se falhar

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando WhatsApp Activity Monitor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = $PSScriptRoot

# Tentar iniciar Signal API (opcional)
Write-Host "Tentando iniciar Signal API (opcional)..." -ForegroundColor Yellow
try {
    npm run start:signal-api
    Write-Host "Signal API iniciado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Signal API não disponível (Docker pode não estar rodando)" -ForegroundColor Yellow
    Write-Host "Continuando sem Signal API - apenas WhatsApp estará disponível" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Iniciando servidor backend..." -ForegroundColor Green
Write-Host ""

# Iniciar o servidor
npx tsx src/server.ts

