# Manual Deployment Readiness Check

Run these commands in your terminal to check if you're ready for deployment:

## Quick Checks (Run these commands)

### 1. Check Git Status
```powershell
git status
```
**Expected:** Working tree clean (no uncommitted changes)

### 2. Check if Code is Pushed
```powershell
git log origin/main..HEAD
```
**Expected:** No output (means everything is pushed)

### 3. Check for Old Import Paths
```powershell
Select-String -Path "src\**\*.ts" -Pattern "from.*auth.*nextauth.*route"
```
**Expected:** No matches found

### 4. Check authOptions File Exists
```powershell
Test-Path "src\lib\authOptions.ts"
```
**Expected:** `True`

### 5. Check Package.json
```powershell
Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty scripts
```
**Expected:** Should show `build` script

### 6. Check Next.js Config
```powershell
Test-Path "next.config.js"
```
**Expected:** `True`

### 7. **TEST BUILD** (Most Important!)
```powershell
npm run build
```
**Expected:** Build completes successfully with no errors

---

## All-in-One Check Command

Run this single command to check everything at once:

```powershell
Write-Host "`n=== DEPLOYMENT CHECK ===" -ForegroundColor Cyan; Write-Host "`n1. Git Status:" -ForegroundColor Yellow; git status --short; Write-Host "`n2. AuthOptions File:" -ForegroundColor Yellow; if (Test-Path "src\lib\authOptions.ts") { Write-Host "   [OK] Exists" -ForegroundColor Green } else { Write-Host "   [ERROR] Missing!" -ForegroundColor Red }; Write-Host "`n3. Old Imports:" -ForegroundColor Yellow; $old = Select-String -Path "src\**\*.ts" -Pattern "from.*auth.*nextauth.*route" -ErrorAction SilentlyContinue; if ($old) { Write-Host "   [ERROR] Found old imports!" -ForegroundColor Red } else { Write-Host "   [OK] No old imports" -ForegroundColor Green }; Write-Host "`n4. Build Script:" -ForegroundColor Yellow; if (Test-Path "package.json") { $pkg = Get-Content package.json | ConvertFrom-Json; if ($pkg.scripts.build) { Write-Host "   [OK] Build script exists" -ForegroundColor Green } else { Write-Host "   [ERROR] No build script!" -ForegroundColor Red } } else { Write-Host "   [ERROR] package.json missing!" -ForegroundColor Red }; Write-Host "`n=== Run 'npm run build' to test build ===" -ForegroundColor Cyan
```

---

## Manual Checklist

- [ ] **Git Status:** `git status` shows clean working tree
- [ ] **Code Pushed:** `git log origin/main..HEAD` shows nothing
- [ ] **No Old Imports:** No files importing from `auth/[...nextauth]/route`
- [ ] **authOptions Exists:** `src/lib/authOptions.ts` file exists
- [ ] **Build Works:** `npm run build` completes successfully
- [ ] **Environment Variables:** Documented in `.env.example` or `DEPLOYMENT_READY.md`

---

## If Build Fails

1. Check the error message
2. Fix the issues
3. Run `npm run build` again
4. Once build succeeds, you're ready to deploy!

---

## Ready to Deploy?

If all checks pass:
1. ✅ Code is committed and pushed
2. ✅ No old import paths
3. ✅ Build completes successfully
4. ✅ All files in place

**Then you can deploy to Vercel!** 🚀

