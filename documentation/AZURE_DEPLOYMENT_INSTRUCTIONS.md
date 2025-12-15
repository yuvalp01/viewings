# Azure App Service Deployment Instructions

This document provides instructions for configuring Azure App Service to run the Next.js application without standalone mode.

## Prerequisites

- Azure App Service Web App (Linux) created
- GitHub repository connected to Azure Deployment Center
- Required secrets configured in GitHub Actions:
  - `DATABASE_URL` - Azure SQL Database connection string
  - `AZUREAPPSERVICE_PUBLISHPROFILE_VIEWINGS` - Azure publish profile

## Azure App Service Configuration

### 1. Set Node.js Version

Ensure your Azure App Service is configured to use Node.js 24.x:

1. Go to Azure Portal → Your App Service → Configuration → General settings
2. Set **Stack** to `Node 24 LTS` (or latest 24.x version)
3. Save the configuration

Alternatively, you can set it via Azure CLI:
```bash
az webapp config appsettings set --resource-group <your-resource-group> --name viewings --settings WEBSITE_NODE_DEFAULT_VERSION="~24"
```

### 2. Configure Startup Command

Set the startup command to run Next.js:

1. Go to Azure Portal → Your App Service → Configuration → General settings
2. Set **Startup Command** to:
   ```
   npm start
   ```
   Or alternatively:
   ```
   node_modules/.bin/next start -p $PORT
   ```
3. Save the configuration

**Note**: The `$PORT` environment variable is automatically set by Azure App Service.

### 3. Configure Environment Variables

Set the following application settings (environment variables):

1. Go to Azure Portal → Your App Service → Configuration → Application settings
2. Add the following settings:

| Name | Value | Description |
|------|-------|-------------|
| `DATABASE_URL` | Your Azure SQL connection string | Required for Prisma database access |
| `OPENAI_API_KEY` | Your OpenAI API key | Required for AI ad data extraction feature |
| `EXTRACTION_RATE_LIMIT` | `10` (optional) | Rate limit for ad extraction API |
| `NODE_ENV` | `production` | Set to production mode |

3. Click **Save** to apply changes

### 4. Enable Build During Deployment (REQUIRED)

**IMPORTANT**: The deployment package does NOT include `node_modules` to keep the package size small (<50 MB instead of 268+ MB). Azure must install dependencies during deployment.

1. Go to Azure Portal → Your App Service → Configuration → General settings
2. Set **SCM_DO_BUILD_DURING_DEPLOYMENT** to `true`
3. This will run `npm install --production` on Azure after deployment
4. The `postinstall` script in `package.json` will automatically generate Prisma Client

**Why this is required**: 
- The deployment package excludes `node_modules` to avoid Azure deployment size limits
- Azure will automatically install production dependencies when this setting is enabled
- Prisma Client is generated via the `postinstall` hook in `package.json`

**Alternative**: If you prefer to install dependencies manually, you can set the startup command to:
```
npm install --production && npm start
```
However, this is slower as it runs on every restart.

### 5. Verify Deployment

After deployment:

1. Check the deployment logs in Azure Portal → Your App Service → Deployment Center
2. Verify the application starts successfully:
   - Go to Azure Portal → Your App Service → Log stream
   - Look for "Ready" message from Next.js
3. Test the application URL

## Troubleshooting

### Application fails to start

- Check Log stream for error messages
- Verify Node.js version matches (24.x)
- Ensure startup command is set correctly
- Verify all environment variables are set

### Database connection errors

- Verify `DATABASE_URL` is correctly set in Application settings
- Check Azure SQL firewall rules allow connections from App Service
- Ensure Prisma Client is generated (check if `node_modules/@prisma/client` exists)

### Build errors during deployment

- Check GitHub Actions workflow logs
- Verify `DATABASE_URL` secret is set in GitHub repository secrets
- Ensure Prisma schema is valid

## Deployment Flow

1. **GitHub Actions Build Job**:
   - Installs dependencies (`npm ci`)
   - Generates Prisma Client (`npx prisma generate`)
   - Builds Next.js app (`npm run build`)
   - Packages deployment artifacts (`.next`, `public`, `package.json`, `package-lock.json`, `prisma`)
   - **Note**: `node_modules` is NOT included to keep package size small

2. **GitHub Actions Deploy Job**:
   - Downloads build artifacts
   - Deploys to Azure App Service using publish profile

3. **Azure App Service**:
   - Receives deployment package
   - Installs production dependencies (`npm install --production`) if `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
   - Prisma Client is generated via `postinstall` script
   - Runs startup command (`npm start`)
   - Next.js starts on the configured port

## Additional Notes

- The application uses standard Next.js output mode (not standalone)
- **`node_modules` is NOT included** in the deployment package to avoid size limits (~268 MB → ~50 MB)
- Azure installs production dependencies during deployment when `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- Prisma Client is generated automatically via the `postinstall` script in `package.json` when Azure runs `npm install`
- Ensure `SCM_DO_BUILD_DURING_DEPLOYMENT=true` is set, otherwise the app will fail to start due to missing dependencies

