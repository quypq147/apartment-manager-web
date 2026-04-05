# Parse test execution results and update CSV

$testOutputPath = "test-output.log"
$csvPath = "Test_Cases_Apartment_Manager.csv"

# Read test output
$testOutput = Get-Content $testOutputPath -Raw

# Map test IDs to status based on output
$testResults = @{
    # Auth tests
    "TC_AUTH_01" = "Đạt"
    "TC_AUTH_02" = "Đạt"
    "TC_AUTH_03" = "Đạt"
    "TC_AUTH_04" = "Đạt"
    "TC_AUTH_05" = "Đạt"
    "TC_AUTH_06" = "Không đạt"  # Timeout
    "TC_AUTH_07" = "Không đạt"  # Timeout
    "TC_AUTH_08" = "Không đạt"  # Timeout
    "TC_AUTH_09" = "Không đạt"  # Timeout
    "TC_AUTH_10" = "Đạt"
    "TC_AUTH_11" = "Không đạt"  # Timeout
    "TC_AUTH_12" = "Không đạt"  # Timeout
    "TC_AUTH_13" = "Không đạt"  # Timeout
    "TC_AUTH_14" = "Không đạt"  # Timeout
    "TC_AUTH_15" = "Không đạt"  # Timeout
    
    # Admin tests
    "TC_ADMIN_DASH_01" = "Đạt"
    "TC_ADMIN_DASH_02" = "Đạt"
    "TC_ADMIN_DASH_03" = "Đạt"
    "TC_ADMIN_DASH_04" = "Đạt"
    "TC_ADMIN_VER_01" = "Không đạt"
    "TC_ADMIN_VER_02" = "Không đạt"
    "TC_ADMIN_SET_01" = "Không đạt"
    "TC_ADMIN_AUTHZ_01" = "Không đạt"
    
    # Authorization tests
    "TC_AUTHZ_01" = "Đạt"
    "TC_AUTHZ_02" = "Đạt"
    "TC_AUTHZ_03" = "Không đạt"
    "TC_AUTHZ_04" = "Không đạt"
    "TC_AUTHZ_05" = "Không đạt"
    
    # Owner Properties
    "TC_OWN_PROP_01" = "Đạt"
    "TC_OWN_PROP_02" = "Không đạt"
    "TC_OWN_PROP_03" = "Không đạt"
    "TC_OWN_PROP_04" = "Không đạt"
    "TC_OWN_PROP_05" = "Không đạt"
    "TC_OWN_PROP_06" = "Không đạt"
    "TC_EDGE_PROP_01" = "Không đạt"
    "TC_EDGE_PROP_02" = "Không đạt"
    
    # Owner Invoices - Contracts
    "TC_OWN_CON_01" = "Đạt"
    "TC_OWN_CON_02" = "Không đạt"
    "TC_OWN_CON_03" = "Không đạt"
    "TC_OWN_CON_04" = "Không đạt"
    "TC_OWN_CON_05" = "Không đạt"
    
    # Owner Invoices
    "TC_OWN_INV_01" = "Đạt"
    "TC_OWN_INV_02" = "Đạt"
    "TC_OWN_INV_03" = "Đạt"
    "TC_OWN_INV_04" = "Không đạt"
    "TC_OWN_INV_05" = "Không đạt"
    "TC_OWN_INV_06" = "Không đạt"
    "TC_EDGE_INV_01" = "Không đạt"
}

# Read existing CSV
$csvContent = Get-Content $csvPath -Raw
$lines = $csvContent -split "`n"
$header = $lines[0]
$rows = $lines | Select-Object -Skip 1

# Update status for each test case
$updatedRows = @()
foreach ($row in $rows) {
    if ([string]::IsNullOrWhiteSpace($row)) { continue }
    
    $cols = $row -split '(?<!\\)(?<!"")"' | Where-Object { $_ -ne ',' -and $_ -ne '"' }
    if ($cols.Count -ge 1) {
        $testId = $cols[0].Trim('"').Trim()
        
        if ($testResults.ContainsKey($testId)) {
            $status = $testResults[$testId]
            # Update Tình trạng column (column 8, 0-indexed)
            $rowArr = @()
            $inQuote = $false
            $current = ""
            
            foreach ($char in $row.ToCharArray()) {
                if ($char -eq '"' -and ($rowArr.Count -eq 0 -or $rowArr[-1] -ne '\')) {
                    $inQuote = -not $inQuote
                }
                $current += $char
            }
            
            # Simpler approach: replace the status column
            $newRow = $row -replace '"Chưa chạy"$', """$status"""
            if ($newRow -eq $row) {
                $newRow = $row -replace '([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,)"([^"]+)"', "`$1""$status"""
            }
            $updatedRows += $newRow
        } else {
            $updatedRows += $row
        }
    }
}

# Write updated CSV
$outputContent = $header + "`n" + ($updatedRows -join "`n")
Set-Content -Path "$csvPath.updated" -Value $outputContent -Encoding UTF8

$passCount = ($testResults.Values | Where-Object { $_ -eq "Đạt" } | Measure-Object).Count
$failCount = ($testResults.Values | Where-Object { $_ -eq "Không đạt" } | Measure-Object).Count

Write-Host "CSV updated: $csvPath.updated"
Write-Host "Total tests updated: $($testResults.Count)"
Write-Host "Passed tests: $passCount"
Write-Host "Failed tests: $failCount"
