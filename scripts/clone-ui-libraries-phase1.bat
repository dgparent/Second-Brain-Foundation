@echo off
REM UI Library Cloning Script - Windows
REM Second Brain Foundation - Phase 1 Essential Libraries

echo ===================================================================
echo 📚 Second Brain Foundation - UI Library Collection
echo ===================================================================
echo.
echo Cloning essential open-source UI libraries for reference...
echo.

REM Create libraries directory
set "LIBS_DIR=C:\!Projects\SecondBrainFoundation\libraries"
if not exist "%LIBS_DIR%" mkdir "%LIBS_DIR%"
cd /d "%LIBS_DIR%"

echo 📁 Library directory: %LIBS_DIR%
echo.

REM Phase 1: Essential (Must Have)
echo 🚀 Phase 1: Cloning Essential Libraries...
echo.

echo [1/7] Cloning text-generation-webui (Chat UI) ⭐ 45.4K...
git clone --depth 1 https://github.com/oobabooga/text-generation-webui.git
echo ✅ Done
echo.

echo [2/7] Cloning SurfSense (NotebookLM alternative) ⭐ 10.6K...
git clone --depth 1 https://github.com/MODSetter/SurfSense.git
echo ✅ Done
echo.

echo [3/7] Cloning mdx-editor (Markdown editor) ⭐ 3.0K...
git clone --depth 1 https://github.com/mdx-editor/editor.git mdx-editor
echo ✅ Done
echo.

echo [4/7] Cloning FreedomGPT (Electron chat) ⭐ 2.7K...
git clone --depth 1 https://github.com/ohmplatform/FreedomGPT.git
echo ✅ Done
echo.

echo [5/7] Cloning obsidian-textgenerator (AI integration) ⭐ 1.8K...
git clone --depth 1 https://github.com/nhaouari/obsidian-textgenerator-plugin.git
echo ✅ Done
echo.

echo [6/7] Cloning rich-markdown-editor (Prosemirror) ⭐ 2.9K...
git clone --depth 1 https://github.com/outline/rich-markdown-editor.git
echo ✅ Done
echo.

echo [7/7] Cloning react-md-editor (Split view) ⭐ 2.7K...
git clone --depth 1 https://github.com/uiwjs/react-md-editor.git
echo ✅ Done
echo.

echo ===================================================================
echo ✨ Phase 1 Complete!
echo ===================================================================
echo.
echo Libraries cloned:
dir /b
echo.
echo Next step: Run Phase 2 to clone Obsidian ecosystem references
echo.

pause
