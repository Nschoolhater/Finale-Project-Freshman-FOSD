# Vercel Deployment Guide

This guide will help you deploy your Bun Site application to Vercel and commit it to GitHub.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)
3. Git installed on your computer

## Step 1: Commit Code to GitHub

### Initialize Git Repository (if not already done)

```bash
git init
```

### Add All Files

```bash
git add .
```

### Create Initial Commit

```bash
git commit -m "Initial commit: Bun Site application"
```

### Add GitHub Remote

```bash
git remote add origin https://github.com/Nschoolhater/Finale-Project-Freshman-FOSD.git
```

### Push to GitHub

```bash
git branch -M main
git push -u origin main
```

**Note:** If the repository already exists and has content, you may need to pull first:
```bash
git pull origin main --allow-unrelated-histories
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository:
   - Select **"Import Git Repository"**
   - Choose `Finale-Project-Freshman-FOSD` from the list
   - Click **"Import"**
4. Configure the project:
   - **Framework Preset:** Other (or leave as default)
   - **Root Directory:** `./` (default)
   - **Build Command:** Leave empty (no build step needed)
   - **Output Directory:** Leave empty
5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add `ENCRYPTION_KEY` with your encryption key value
     - Generate a key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
     - Copy the 64-character hex string
     - Add it as `ENCRYPTION_KEY` in Vercel
6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

5. Set environment variables:
   ```bash
   vercel env add ENCRYPTION_KEY
   ```
   (Enter your encryption key when prompted)

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Important Notes

### ⚠️ Storage Limitations on Vercel

**Important:** Vercel uses serverless functions with an ephemeral filesystem. This means:

1. **SQLite Database:** The `survey.db` file will be stored in `/tmp` but **data will NOT persist** between deployments or function invocations. Each serverless function invocation gets a fresh `/tmp` directory.

2. **JSON Files:** Similarly, `users.json` and `surveys.json` stored in `/tmp` will not persist.

3. **Recommended Solutions:**
   - **For Production:** Migrate to a persistent database service:
     - Vercel Postgres (recommended)
     - Supabase
     - PlanetScale
     - MongoDB Atlas
     - Or any other cloud database service
   - **For Development/Testing:** The current setup will work, but data will reset frequently.

### Environment Variables

Make sure to set the `ENCRYPTION_KEY` environment variable in Vercel:
1. Go to your project settings in Vercel
2. Navigate to **Environment Variables**
3. Add `ENCRYPTION_KEY` with your 64-character hex encryption key
4. Apply to all environments (Production, Preview, Development)

### Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain and follow the DNS configuration instructions

## Step 4: Updating Your Deployment

Whenever you push changes to GitHub:

1. **Automatic Deployment:** Vercel will automatically detect pushes to your main branch and deploy
2. **Manual Deployment:** You can also trigger deployments from the Vercel dashboard

## Troubleshooting

### Build Errors

If you encounter build errors:
- Check that all dependencies are listed in `package.json`
- Ensure Node.js version is compatible (>=14)
- Check Vercel build logs for specific error messages

### Database/Storage Issues

If you're experiencing data loss:
- This is expected with the current file-based storage on Vercel
- Consider migrating to a persistent database service (see recommendations above)

### Environment Variables Not Working

- Make sure `ENCRYPTION_KEY` is set in Vercel project settings
- Redeploy after adding environment variables
- Check that the variable name matches exactly (case-sensitive)

## Next Steps

1. ✅ Code is committed to GitHub
2. ✅ Application is deployed to Vercel
3. 🔄 Consider migrating to a persistent database for production use
4. 🔄 Set up custom domain (optional)
5. 🔄 Configure CI/CD for automated testing (optional)

## Support

For issues or questions:
- Vercel Documentation: https://vercel.com/docs
- GitHub Repository: https://github.com/Nschoolhater/Finale-Project-Freshman-FOSD

