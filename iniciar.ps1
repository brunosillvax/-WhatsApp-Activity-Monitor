# Script para iniciar o WhatsApp Activity Monitor
# Este script inicia o backend e o frontend em terminais separados

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WhatsApp Activity Monitor - Iniciando..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = $PSScriptRoot

# Verificar se estamos no diretório correto
if (-not (Test-Path "$projectPath\package.json")) {
    Write-Host "Erro: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script a partir do diretório do projeto." -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando backend em um novo terminal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host 'Backend iniciando...' -ForegroundColor Green; npm run start:server"

Write-Host "Aguardando 5 segundos antes de iniciar o frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Iniciando frontend em um novo terminal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host 'Frontend iniciando...' -ForegroundColor Green; npm run start:client"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servidores iniciados!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "O backend está rodando em um terminal separado" -ForegroundColor Cyan
Write-Host "O frontend está rodando em outro terminal separado" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar este script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

