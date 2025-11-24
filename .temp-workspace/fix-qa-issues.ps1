# QA Issues Fix Script
# Fixes all critical naming inconsistencies identified in QA analysis

Write-Host "===== Second Brain Foundation - QA Fixes =====" -ForegroundColor Cyan
Write-Host ""

# Track changes
$changes = @()

# Function to update package.json name
function Update-PackageName {
    param($PackagePath, $OldName, $NewName)
    
    $packageJsonPath = Join-Path $PackagePath "package.json"
    if (Test-Path $packageJsonPath) {
        $content = Get-Content $packageJsonPath -Raw
        $content = $content -replace "`"name`":\s*`"$OldName`"", "`"name`": `"$NewName`""
        Set-Content $packageJsonPath $content -NoNewline
        Write-Host "✓ Updated package.json: $OldName → $NewName" -ForegroundColor Green
        return $true
    }
    return $false
}

# Function to rename directory
function Rename-PackageDirectory {
    param($OldPath, $NewPath)
    
    if (Test-Path $OldPath) {
        if (Test-Path $NewPath) {
            Write-Host "⚠ Target already exists: $NewPath" -ForegroundColor Yellow
            return $false
        }
        Move-Item $OldPath $NewPath -Force
        Write-Host "✓ Renamed directory: $OldPath → $NewPath" -ForegroundColor Green
        return $true
    }
    return $false
}

Write-Host "Phase 1: Fix plugins → modules naming (8 packages)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# 1. budgeting
$oldPath = "packages\@sbf\modules\budgeting"
$newPath = "packages\@sbf\modules\budgeting-temp"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-budgeting" "@sbf/modules-budgeting"
    $changes += @{Old="@sbf/plugins-budgeting"; New="@sbf/modules-budgeting"}
}

# 2. fitness-tracking
$oldPath = "packages\@sbf\modules\fitness-tracking"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-fitness-tracking" "@sbf/modules-fitness-tracking"
    $changes += @{Old="@sbf/plugins-fitness-tracking"; New="@sbf/modules-fitness-tracking"}
}

# 3. medication-tracking
$oldPath = "packages\@sbf\modules\medication-tracking"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-medication-tracking" "@sbf/modules-medication-tracking"
    $changes += @{Old="@sbf/plugins-medication-tracking"; New="@sbf/modules-medication-tracking"}
}

# 4. nutrition-tracking
$oldPath = "packages\@sbf\modules\nutrition-tracking"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-nutrition-tracking" "@sbf/modules-nutrition-tracking"
    $changes += @{Old="@sbf/plugins-nutrition-tracking"; New="@sbf/modules-nutrition-tracking"}
}

# 5. personal-tasks
$oldPath = "packages\@sbf\modules\personal-tasks"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-personal-tasks" "@sbf/modules-personal-tasks"
    $changes += @{Old="@sbf/plugins-personal-tasks"; New="@sbf/modules-personal-tasks"}
}

# 6. portfolio-tracking
$oldPath = "packages\@sbf\modules\portfolio-tracking"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-portfolio-tracking" "@sbf/modules-portfolio-tracking"
    $changes += @{Old="@sbf/plugins-portfolio-tracking"; New="@sbf/modules-portfolio-tracking"}
}

# 7. relationship-crm
$oldPath = "packages\@sbf\modules\relationship-crm"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugins-relationship-crm" "@sbf/modules-relationship-crm"
    $changes += @{Old="@sbf/plugins-relationship-crm"; New="@sbf/modules-relationship-crm"}
}

# 8. va-dashboard
$oldPath = "packages\@sbf\modules\va-dashboard"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/plugin-va-dashboard" "@sbf/modules-va-dashboard"
    $changes += @{Old="@sbf/plugin-va-dashboard"; New="@sbf/modules-va-dashboard"}
}

Write-Host ""
Write-Host "Phase 2: Add modules- prefix (4 packages)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# 1. agriculture
$oldPath = "packages\@sbf\modules\agriculture"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/agriculture" "@sbf/modules-agriculture"
    $changes += @{Old="@sbf/agriculture"; New="@sbf/modules-agriculture"}
}

# 2. healthcare
$oldPath = "packages\@sbf\modules\healthcare"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/healthcare" "@sbf/modules-healthcare"
    $changes += @{Old="@sbf/healthcare"; New="@sbf/modules-healthcare"}
}

# 3. highlights
$oldPath = "packages\@sbf\modules\highlights"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/highlights" "@sbf/modules-highlights"
    $changes += @{Old="@sbf/highlights"; New="@sbf/modules-highlights"}
}

# 4. learning-tracker
$oldPath = "packages\@sbf\modules\learning-tracker"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/learning-tracker" "@sbf/modules-learning-tracker"
    $changes += @{Old="@sbf/learning-tracker"; New="@sbf/modules-learning-tracker"}
}

Write-Host ""
Write-Host "Phase 3: Fix framework naming (1 package)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# knowledge-tracking
$oldPath = "packages\@sbf\frameworks\knowledge-tracking"
if (Test-Path $oldPath) {
    Update-PackageName $oldPath "@sbf/knowledge-tracking" "@sbf/frameworks-knowledge-tracking"
    $changes += @{Old="@sbf/knowledge-tracking"; New="@sbf/frameworks-knowledge-tracking"}
}

Write-Host ""
Write-Host "Phase 4: Move ops packages to modules folder" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# Move root-level ops packages to modules folder (except duplicates which we'll handle separately)
$opsPackages = @(
    "construction-ops",
    "hospitality-ops",
    "insurance-ops",
    "logistics-ops",
    "manufacturing-ops",
    "renewable-ops",
    "security-ops"
)

foreach ($pkg in $opsPackages) {
    $oldPath = "packages\@sbf\$pkg"
    $newPath = "packages\@sbf\modules\$pkg"
    
    if ((Test-Path $oldPath) -and (-not (Test-Path $newPath))) {
        # First update package name to add modules- prefix
        Update-PackageName $oldPath "@sbf/$pkg" "@sbf/modules-$pkg"
        # Then move to modules folder
        Move-Item $oldPath $newPath -Force
        Write-Host "✓ Moved $pkg to modules folder" -ForegroundColor Green
        $changes += @{Old="@sbf/$pkg"; New="@sbf/modules-$pkg"}
    }
}

Write-Host ""
Write-Host "Phase 5: Handle duplicate packages" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# Remove root-level duplicates, keep modules folder versions
$duplicates = @(
    @{Root="packages\@sbf\legal-ops"; Module="packages\@sbf\modules\legal-ops"},
    @{Root="packages\@sbf\property-ops"; Module="packages\@sbf\modules\property-mgmt"},
    @{Root="packages\@sbf\restaurant-haccp-ops"; Module="packages\@sbf\modules\restaurant-haccp"}
)

foreach ($dup in $duplicates) {
    if (Test-Path $dup.Root) {
        # Update module version name first
        $moduleName = ($dup.Module -split '\\')[-1]
        Update-PackageName $dup.Module "@sbf/$moduleName" "@sbf/modules-$moduleName"
        
        # Remove root duplicate
        Remove-Item $dup.Root -Recurse -Force
        Write-Host "✓ Removed duplicate: $($dup.Root)" -ForegroundColor Green
        
        $rootName = ($dup.Root -split '\\')[-1]
        $changes += @{Old="@sbf/$rootName"; New="@sbf/modules-$moduleName"}
    }
}

Write-Host ""
Write-Host "Phase 6: Handle incomplete legal package" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# Remove incomplete legal package (no tsconfig)
$incompleteLegal = "packages\@sbf\modules\legal"
if (Test-Path $incompleteLegal) {
    $hasTsConfig = Test-Path (Join-Path $incompleteLegal "tsconfig.json")
    if (-not $hasTsConfig) {
        Remove-Item $incompleteLegal -Recurse -Force
        Write-Host "✓ Removed incomplete package: modules/legal (no tsconfig)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Phase 7: Update version numbers to 1.0.0" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Cyan

# Update all module versions to 1.0.0 (production ready)
Get-ChildItem "packages\@sbf\modules" -Directory | ForEach-Object {
    $packageJsonPath = Join-Path $_.FullName "package.json"
    if (Test-Path $packageJsonPath) {
        $content = Get-Content $packageJsonPath -Raw
        $content = $content -replace "`"version`":\s*`"0\.1\.0`"", "`"version`": `"1.0.0`""
        Set-Content $packageJsonPath $content -NoNewline
        Write-Host "✓ Updated version to 1.0.0: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "===== Summary of Changes =====" -ForegroundColor Cyan
Write-Host "Total package name changes: $($changes.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update all imports across codebase" -ForegroundColor White
Write-Host "2. Regenerate module registry" -ForegroundColor White
Write-Host "3. Run npm install" -ForegroundColor White
Write-Host "4. Run build and tests" -ForegroundColor White
Write-Host ""

# Save changes for import update script
$changes | ConvertTo-Json | Set-Content ".temp-workspace\package-name-changes.json"
Write-Host "✓ Saved changes map to .temp-workspace\package-name-changes.json" -ForegroundColor Green
