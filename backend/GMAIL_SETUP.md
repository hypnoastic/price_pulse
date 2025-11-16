# Gmail API Setup Guide

This guide will help you set up Gmail API with refresh token authentication for PricePulse.

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Give it a name (e.g., "PricePulse Gmail")
5. Click "Create"
6. Download the credentials JSON file
7. Rename it to `credentials.json` and place it in the `backend` directory

## Step 3: Generate Refresh Token

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
   ```

3. Run the setup script:
   ```bash
   python setup_gmail.py
   ```

4. This will:
   - Open your browser for Google OAuth
   - Ask you to sign in with your Gmail account
   - Grant permissions to send emails
   - Generate the refresh token
   - Display the credentials to add to your `.env` file

## Step 4: Update Environment Variables

Add the generated credentials to your `.env` file:

```env
GMAIL_USER="your-email@gmail.com"
GMAIL_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-google-client-secret"
GMAIL_REFRESH_TOKEN="your-gmail-refresh-token"
```

## Step 5: Test the Setup

1. Start your FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

2. Try registering a new account to test OTP email sending

## Security Notes

- Keep your `credentials.json` file secure and don't commit it to version control
- The refresh token allows long-term access to send emails
- Store all credentials securely in environment variables
- Consider using different Gmail accounts for development and production

## Troubleshooting

**Error: "Access blocked"**
- Make sure you're using the correct Google account
- Check that Gmail API is enabled in your project

**Error: "Invalid credentials"**
- Verify your client ID and secret are correct
- Make sure the refresh token hasn't expired

**Error: "Quota exceeded"**
- Gmail API has daily sending limits
- For production, consider upgrading your quota or using a dedicated email service

## Production Deployment

For production deployment:
1. Use environment variables for all credentials
2. Consider using Google Cloud Service Account for server-to-server authentication
3. Monitor your Gmail API usage and quotas
4. Set up proper error handling and logging