# GitHub Pages Setup Guide

This guide will help you set up GitHub Pages to host the Comment Craft website.

## Quick Setup

### Option 1: Using GitHub Actions (Recommended)

1. **Enable GitHub Pages in Repository Settings:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Push the website files:**
   ```bash
   git add index.html images/ .github/workflows/pages.yml
   git commit -m "Add website for GitHub Pages"
   git push origin main
   ```

3. **Wait for deployment:**
   - GitHub Actions will automatically deploy your site
   - Check the **Actions** tab to see the deployment status
   - Your site will be available at: `https://<username>.github.io/comment-craft/`

### Option 2: Using Root Directory (Simple)

1. **Enable GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select **main** (or **master**) branch
   - Select **/ (root)** as the folder
   - Click **Save**

2. **Your site will be live at:**
   - `https://<username>.github.io/comment-craft/`

### Option 3: Using Docs Folder

If you prefer to keep the website in a separate folder:

1. Move `index.html` and `images/` to a `docs/` folder
2. In **Settings** → **Pages**, select **/docs** as the source
3. Your site will be available at the same URL

## Custom Domain (Optional)

If you have a custom domain:

1. Add a `CNAME` file in the root (or docs folder) with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS settings as per GitHub Pages documentation

## Troubleshooting

- **Site not updating?** Check the Actions tab for deployment errors
- **404 errors?** Make sure the source branch and folder are correctly set
- **Images not loading?** Ensure image paths are relative (e.g., `images/icon.png`)

## Notes

- The website uses Tailwind CSS via CDN, so no build process is needed
- All assets (images, HTML) are served directly from the repository
- The site is fully responsive and works on all devices

