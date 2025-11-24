# Update all imports across codebase to reflect new package names

Write-Host "===== Updating Imports Across Codebase =====" -ForegroundColor Cyan
Write-Host ""

# Load changes map
$changesJson = Get-Content ".temp-workspace\package-name-changes.json" -Raw
$changes = $changesJson | ConvertFrom-Json

Write-Host "Loaded $($changes.Count) package name changes" -ForegroundColor Yellow
Write-Host ""

# Define search patterns
$importPatterns = @{
    # Old plugin names
    "@sbf/plugins-budgeting" = "@sbf/modules-budgeting"
    "@sbf/plugins-fitness-tracking" = "@sbf/modules-fitness-tracking"
    "@sbf/plugins-medication-tracking" = "@sbf/modules-medication-tracking"
    "@sbf/plugins-nutrition-tracking" = "@sbf/modules-nutrition-tracking"
    "@sbf/plugins-personal-tasks" = "@sbf/modules-personal-tasks"
    "@sbf/plugins-portfolio-tracking" = "@sbf/modules-portfolio-tracking"
    "@sbf/plugins-relationship-crm" = "@sbf/modules-relationship-crm"
    "@sbf/plugin-va-dashboard" = "@sbf/modules-va-dashboard"
    
    # Missing prefix
    "@sbf/agriculture" = "@sbf/modules-agriculture"
    "@sbf/healthcare" = "@sbf/modules-healthcare"
    "@sbf/highlights" = "@sbf/modules-highlights"
    "@sbf/learning-tracker" = "@sbf/modules-learning-tracker"
    
    # Framework naming
    "@sbf/knowledge-tracking" = "@sbf/frameworks-knowledge-tracking"
    
    # Ops packages
    "@sbf/construction-ops" = "@sbf/modules-construction-ops"
    "@sbf/hospitality-ops" = "@sbf/modules-hospitality-ops"
    "@sbf/insurance-ops" = "@sbf/modules-insurance-ops"
    "@sbf/logistics-ops" = "@sbf/modules-logistics-ops"
    "@sbf/manufacturing-ops" = "@sbf/modules-manufacturing-ops"
    "@sbf/renewable-ops" = "@sbf/modules-renewable-ops"
    "@sbf/security-ops" = "@sbf/modules-security-ops"
    "@sbf/legal-ops" = "@sbf/modules-legal-ops"
    "@sbf/property-ops" = "@sbf/modules-property-mgmt"
    "@sbf/property-mgmt" = "@sbf/modules-property-mgmt"
    "@sbf/restaurant-haccp-ops" = "@sbf/modules-restaurant-haccp"
    "@sbf/restaurant-haccp" = "@sbf/modules-restaurant-haccp"
}

# File extensions to search
$extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.md")

# Directories to search
$searchDirs = @(
    "packages",
    "aei-core",
    "libraries",
    "scripts"
)

$totalFiles = 0
$totalReplacements = 0

foreach ($dir in $searchDirs) {
    if (-not (Test-Path $dir)) { continue }
    
    Write-Host "Searching in: $dir" -ForegroundColor Cyan
    
    foreach ($ext in $extensions) {
        $files = Get-ChildItem -Path $dir -Filter $ext -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
            $_.FullName -notmatch "node_modules" -and 
            $_.FullName -notmatch "dist" -and 
            $_.FullName -notmatch ".next"
        }
        
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $modified = $false
            $originalContent = $content
            
            foreach ($oldName in $importPatterns.Keys) {
                $newName = $importPatterns[$oldName]
                if ($content -match [regex]::Escape($oldName)) {
                    $content = $content -replace [regex]::Escape($oldName), $newName
                    $modified = $true
                }
            }
            
            if ($modified) {
                Set-Content $file.FullName $content -NoNewline
                $totalFiles++
                
                # Count replacements
                foreach ($oldName in $importPatterns.Keys) {
                    $matches = ([regex]::Matches($originalContent, [regex]::Escape($oldName))).Count
                    if ($matches -gt 0) {
                        $totalReplacements += $matches
                        Write-Host "  ✓ $($file.Name): $matches replacement(s)" -ForegroundColor Green
                    }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "===== Update Complete =====" -ForegroundColor Cyan
Write-Host "Files updated: $totalFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host ""
