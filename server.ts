import express from "express";
import { createServer as createViteServer } from "vite";
import cookieSession from "cookie-session";
import { OAuth2Client } from "google-auth-library";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Trust proxy is required for correct protocol/host detection behind nginx
app.set("trust proxy", 1);

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "literacy-lead-secret"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: "none",
    httpOnly: true,
  })
);

const getRedirectUri = (req: express.Request) => {
  // Use APP_URL if provided, otherwise try to construct it safely
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl.replace(/\/$/, "")}/auth/callback`;
};

// API Routes
app.get("/api/auth/url", (req, res) => {
  const redirectUri = getRedirectUri(req);
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    redirect_uri: redirectUri,
  });
  res.json({ url });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  const redirectUri = getRedirectUri(req);

  try {
    const { tokens } = await client.getToken({
      code: code as string,
      redirect_uri: redirectUri,
    });
    
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (req.session) {
      req.session.user = {
        id: payload?.sub,
        email: payload?.email,
        name: payload?.name,
        picture: payload?.picture,
      };
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/me", (req, res) => {
  if (req.session?.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ success: true });
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
