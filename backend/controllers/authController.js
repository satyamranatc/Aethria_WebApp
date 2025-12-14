import { google } from "googleapis";
import "dotenv/config";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = process.env.PORT || 5500;

// Hardcode callback for localhost development as per extension requirement
// In production, this should be the deployed URL
const REDIRECT_URI = `http://localhost:${PORT}/auth/google/callback`;

export const getOAuthConfig = (req, res) => {
  res.json({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });
};

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// 1. Redirect user to Google Auth URL
export const loginWithGoogle = (req, res) => {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
    });

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Auth redirect error:", error);
    res.status(500).send("Error initiating login");
  }
};

// 2. Handle Google Callback
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get basic user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    const email = data.email;
    const name = data.name;

    if (!email) {
      return res.status(400).send("Could not retrieve email from Google");
    }

    // Redirect back to VS Code
    // We can pass the email and maybe a token (or just email for this simple app)
    // URL Scheme: vscode://<publisher>.<extensionName>/<path>?<query>
    // Publisher: satyamrana, Extension: aethria
    
    // Note: To handle spaces or special chars in name, encode properly
    const vscodeRedirect = `vscode://satyamrana.aethria/auth?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
    
    // Serve a simple HTML page that redirects
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sign In Successful</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0d1117; color: white; }
          .container { text-align: center; }
          h1 { color: #58a6ff; }
          p { color: #8b949e; }
          a { color: #58a6ff; text-decoration: none; border: 1px solid #30363d; padding: 10px 20px; border-radius: 6px; display: inline-block; margin-top: 20px; }
          a:hover { background: #30363d; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sign In Successful! ✅</h1>
          <p>You have signed in as <strong>${email}</strong>.</p>
          <p>Redirecting you back to VS Code...</p>
          <a href="${vscodeRedirect}">Open VS Code</a>
        </div>
        <script>
            // Try to redirect automatically
            setTimeout(() => {
                window.location.href = "${vscodeRedirect}";
            }, 1000);
        </script>
      </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).send("Authentication failed: " + error.message);
  }
};