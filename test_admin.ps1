# Test 1: Register admin
$body = @{
    email = "admin@hovan.com"
    name = "Admin Hovan"
    password = "admin123"
} | ConvertTo-Json

Write-Host "=== TEST 1: Register Admin ==="
try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/register" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Response: $($r.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
}

# Test 2: Login admin
Write-Host ""
Write-Host "=== TEST 2: Login Admin ==="
$loginBody = @{
    email = "admin@hovan.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $r2 = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/login" -Method Post -ContentType "application/json" -Body $loginBody -UseBasicParsing -TimeoutSec 10
    Write-Host "Status: $($r2.StatusCode)"
    Write-Host "Response: $($r2.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
}
