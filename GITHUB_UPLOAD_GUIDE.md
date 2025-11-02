# GitHub Upload Guide

## Prerequisites
- Git installed on your system
- GitHub account created
- Empty GitHub repository created

## Step-by-Step Instructions

### 1. Initialize Git Repository (if not already done)
```powershell
cd "d:\OneDrive\Desktop\project"
git init
```

### 2. Create a .gitignore File
Before committing, create a `.gitignore` file to exclude unnecessary files:

```powershell
# Create .gitignore
@"
# Dependencies
node_modules/
server/node_modules/

# Environment variables
.env
.env.local
server/.env

# Database files
*.db
*.sqlite
*.sqlite3

# Logs
*.log
npm-debug.log*
logs/

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Uploads (optional - uncomment if you don't want to commit user uploads)
# uploads/
# server/uploads/

# Docker volumes
data/
mysql-data/

# Temporary files
*.tmp
*.temp
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

### 3. Stage All Files
```powershell
git add .
```

### 4. Create Initial Commit
```powershell
git commit -m "Initial commit: Alumni Connect Platform"
```

### 5. Add Remote Repository
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 6. Verify Remote Connection
```powershell
git remote -v
```

### 7. Push to GitHub
For the first push:
```powershell
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (PAT), NOT your GitHub password

### 8. Create a Personal Access Token (if needed)
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token and use it as your password when pushing

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```powershell
# Login to GitHub
gh auth login

# Create and push to new repository
gh repo create YOUR_REPO_NAME --public --source=. --remote=origin --push
```

## Common Issues & Solutions

### Issue 1: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Issue 2: "failed to push some refs"
```powershell
# If the remote repository has a README or other files
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Issue 3: Large files causing issues
```powershell
# Check file sizes
git ls-files | ForEach-Object { Write-Host "$_ : $((Get-Item $_).Length / 1MB) MB" }

# If you have large files, consider using Git LFS
git lfs install
git lfs track "*.psd"
git lfs track "*.zip"
```

## Post-Upload Checklist

After uploading, verify on GitHub:
- ✅ All files are present
- ✅ `.gitignore` is working (node_modules should NOT be uploaded)
- ✅ README.md displays correctly
- ✅ Repository description is set
- ✅ Topics/tags are added (optional)

## Update README with Setup Instructions

Add a badge to your README showing the repository status:
```markdown
![GitHub repo size](https://img.shields.io/github/repo-size/YOUR_USERNAME/YOUR_REPO_NAME)
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/YOUR_REPO_NAME?style=social)
```

## Future Updates

To push future changes:
```powershell
git add .
git commit -m "Description of changes"
git push origin main
```

## Creating a Good README

Make sure your `README.md` includes:
1. Project title and description
2. Features list
3. Prerequisites
4. Installation instructions
5. Usage instructions
6. API documentation (if applicable)
7. Screenshots (optional)
8. Contributing guidelines (optional)
9. License information
10. Contact information

## Recommended Repository Settings

On GitHub:
1. Add repository description
2. Add topics: `nodejs`, `mysql`, `alumni-network`, `express`, `docker`
3. Enable Issues (for bug tracking)
4. Add a LICENSE file (MIT, Apache 2.0, etc.)
5. Consider enabling GitHub Pages for documentation
