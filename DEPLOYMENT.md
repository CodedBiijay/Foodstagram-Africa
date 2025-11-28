# Deploying Foodstagram Africa to Vercel

This guide will walk you through deploying your application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free)
- A [GitHub account](https://github.com/signup) (if you want to deploy via Git)
- Your project is already initialized with Git (✅ confirmed)

## Deployment Options

You have two options for deploying to Vercel:

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **foodstagram-africa** (or press Enter)
   - In which directory is your code located? **./** (press Enter)
   - Want to override the settings? **N**

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Recommended for Continuous Deployment)

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com/new)
   - Create a new repository named `foodstagram-africa`
   - **Do NOT** initialize with README (your project already has one)

2. **Push Your Code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/foodstagram-africa.git
   git branch -M main
   git add .
   git commit -m "Initial commit - Foodstagram Africa"
   git push -u origin main
   ```

3. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Click **"Deploy"**

## Post-Deployment Configuration

### Update Your Domain in Code

After deployment, you'll need to update the sitemap and robots.txt with your actual Vercel domain:

1. **Get your Vercel URL** (e.g., `foodstagram-africa.vercel.app`)

2. **Update `public/sitemap.xml`**
   Replace `https://foodstagram-africa.com/` with your Vercel URL

3. **Update `public/robots.txt`**
   Replace `https://foodstagram-africa.com/sitemap.xml` with your Vercel URL

4. **Update `index.html` meta tags**
   Replace `https://foodstagram-africa.com/` in Open Graph and Twitter tags

### Environment Variables (Optional)

If you need to add environment variables:
1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add any required variables

## Custom Domain (Optional)

To use a custom domain like `foodstagram-africa.com`:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update your domain's DNS settings as instructed by Vercel

## Troubleshooting

### Build Fails
- Check the build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Try running `npm run build` locally first

### 404 Errors
- Ensure `dist` is set as the output directory
- Check that `index.html` is in the root of your project

### Blank Page
- Check browser console for errors
- Verify all import paths are correct
- Ensure environment variables are set if needed

## Next Steps After Deployment

1. ✅ Test all features on the live site
2. ✅ Update sitemap.xml with your actual domain
3. ✅ Set up custom domain (optional)
4. ✅ Monitor analytics in Vercel Dashboard
5. ✅ Set up automatic deployments (if using GitHub)

## Automatic Deployments

If you deployed via GitHub, every push to the `main` branch will automatically trigger a new deployment! 🚀
