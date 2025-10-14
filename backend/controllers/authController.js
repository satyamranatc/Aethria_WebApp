// Get OAuth configuration
export const getOAuthConfig = (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost'
  });
};