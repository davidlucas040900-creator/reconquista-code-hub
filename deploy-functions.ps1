# Deploy de todas as Edge Functions

Write-Host " DEPLOY DAS EDGE FUNCTIONS`n" -ForegroundColor Cyan

$functions = @(
    "lojou-webhook",
    "send-welcome-email",
    "payment-webhook",
    "initialize-user-modules",
    "request-access",
    "send-notification",
    "schedule-reminders",
    "release-modules"
)

$projectRef = "csltrjuucicnlhipaszh"

Write-Host " Functions a serem deployadas:" -ForegroundColor Yellow
$functions | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

Write-Host "`n Iniciando deploy...`n" -ForegroundColor Cyan

foreach ($fn in $functions) {
    Write-Host "Deploying $fn..." -ForegroundColor Yellow
    
    try {
        supabase functions deploy $fn --project-ref $projectRef --no-verify-jwt
        Write-Host "✅ $fn deployed!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao fazer deploy de $fn" -ForegroundColor Red
        Write-Host "$_`n" -ForegroundColor Gray
    }
}

Write-Host "✅ Deploy completo!" -ForegroundColor Green
Write-Host "`n📋 Verificar functions:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/$projectRef/functions" -ForegroundColor White
