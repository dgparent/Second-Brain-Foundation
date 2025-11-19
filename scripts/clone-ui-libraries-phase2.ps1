# UI Library Cloning Script - Phase 2
# Missing repositories from ChatGPT analysis

$libsDir = "C:\!Projects\SecondBrainFoundation\libraries"

Write-Output "=" * 70
Write-Output "📚 Second Brain Foundation - UI Library Collection Phase 2"
Write-Output "=" * 70
Write-Output ""
Write-Output "Cloning additional libraries from ChatGPT analysis..."
Write-Output ""

cd $libsDir

# Phase 2 repositories organized by category
$repos = @(
    # PKM / Note / Outliner Systems
    @{ Name = "foam"; URL = "https://github.com/foambubble/foam.git"; Category = "PKM"; Stars = "17.9K" },
    @{ Name = "logseq"; URL = "https://github.com/logseq/logseq.git"; Category = "PKM"; Stars = "34.1K" },
    @{ Name = "athens"; URL = "https://github.com/athensresearch/athens.git"; Category = "PKM"; Stars = "6.3K" },
    @{ Name = "trilium"; URL = "https://github.com/zadam/trilium.git"; Category = "PKM"; Stars = "28.1K" },
    @{ Name = "joplin"; URL = "https://github.com/laurent22/joplin.git"; Category = "PKM"; Stars = "47K" },
    @{ Name = "vnote"; URL = "https://github.com/vnotex/vnote.git"; Category = "PKM"; Stars = "12K" },
    @{ Name = "silverbullet"; URL = "https://github.com/silverbulletmd/silverbullet.git"; Category = "PKM"; Stars = "3.3K" },
    
    # AI UIs & Chat Interfaces
    @{ Name = "open-webui"; URL = "https://github.com/open-webui/open-webui.git"; Category = "AI Chat"; Stars = "52.7K" },
    @{ Name = "jan"; URL = "https://github.com/janhq/jan.git"; Category = "AI Chat"; Stars = "24.7K" },
    @{ Name = "anything-llm"; URL = "https://github.com/Mintplex-Labs/anything-llm.git"; Category = "AI Chat"; Stars = "29.4K" },
    
    # Markdown / Editor Frameworks
    @{ Name = "milkdown"; URL = "https://github.com/Milkdown/milkdown.git"; Category = "Editor"; Stars = "9K" },
    @{ Name = "tiptap"; URL = "https://github.com/ueberdosis/tiptap.git"; Category = "Editor"; Stars = "28.8K" },
    @{ Name = "editor.js"; URL = "https://github.com/codex-team/editor.js.git"; Category = "Editor"; Stars = "29.5K" },
    
    # Graph Visualization Engines
    @{ Name = "cytoscape.js"; URL = "https://github.com/cytoscape/cytoscape.js.git"; Category = "Graph"; Stars = "10.2K" },
    @{ Name = "reagraph"; URL = "https://github.com/reaviz/reagraph.git"; Category = "Graph"; Stars = "2.2K" },
    @{ Name = "sigma.js"; URL = "https://github.com/jacomyal/sigma.js.git"; Category = "Graph"; Stars = "11.5K" },
    @{ Name = "d3"; URL = "https://github.com/d3/d3.git"; Category = "Graph"; Stars = "109K" },
    
    # Canvas / Visual Tools
    @{ Name = "tldraw"; URL = "https://github.com/tldraw/tldraw.git"; Category = "Canvas"; Stars = "37.7K" },
    @{ Name = "excalidraw"; URL = "https://github.com/excalidraw/excalidraw.git"; Category = "Canvas"; Stars = "88.5K" },
    
    # Notion-like UI Systems
    @{ Name = "outline"; URL = "https://github.com/outline/outline.git"; Category = "Wiki"; Stars = "29.9K" },
    @{ Name = "codex"; URL = "https://github.com/appwrite/codex.git"; Category = "Wiki"; Stars = "1.2K" }
)

$totalRepos = $repos.Count
$i = 1

Write-Output "🚀 Cloning $totalRepos repositories..."
Write-Output ""

$clonedCount = 0
$skippedCount = 0
$failedCount = 0

foreach ($repo in $repos) {
    Write-Output "[$i/$totalRepos] $($repo.Category) | $($repo.Name) ⭐ $($repo.Stars)"
    
    if (Test-Path $repo.Name) {
        Write-Output "  ⚠️  Already exists, skipping..."
        $skippedCount++
    } else {
        try {
            git clone --depth 1 $repo.URL $repo.Name 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Output "  ✅ Cloned successfully"
                $clonedCount++
            } else {
                Write-Output "  ❌ Clone failed"
                $failedCount++
            }
        } catch {
            Write-Output "  ❌ Error: $_"
            $failedCount++
        }
    }
    Write-Output ""
    $i++
}

Write-Output "=" * 70
Write-Output "✨ Phase 2 Complete!"
Write-Output "=" * 70
Write-Output ""
Write-Output "📊 Summary:"
Write-Output "  ✅ Cloned:  $clonedCount"
Write-Output "  ⚠️  Skipped: $skippedCount (already existed)"
Write-Output "  ❌ Failed:  $failedCount"
Write-Output ""
Write-Output "📁 Total libraries in folder:"
$totalLibs = (Get-ChildItem -Directory | Measure-Object).Count
Write-Output "  $totalLibs repositories"
Write-Output ""
Write-Output "💾 Estimated disk usage: ~2-4 GB (with --depth 1)"
Write-Output ""
Write-Output "Next: Review libraries/EXTRACTION-GUIDE.md for usage instructions"
Write-Output ""
