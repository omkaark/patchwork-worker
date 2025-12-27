import { SignJWT, jwtVerify } from "jose";
import { renderHtml } from "./renderHtml";

interface AuthEnv extends Env {
  JWT_SECRET: string;
}

interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
  html_url: string;
  created_at: string;
  company: string | null;
  location: string | null;
  bio: string | null;
  followers: number;
  twitter_username: string | null;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/auth" && request.method === "POST") {
      return handleAuth(request, env as AuthEnv);
    }

    return new Response(renderHtml(), {
      headers: { "content-type": "text/html" },
    });
  },
} satisfies ExportedHandler<Env>;

async function handleAuth(request: Request, env: AuthEnv): Promise<Response> {
  try {
    const { github_token }: any = await request.json();
    if (!github_token) {
      return Response.json({ error: "Missing github_token" }, { status: 400 });
    }

    const githubUser = await verifyGitHubToken(github_token);
    if (!githubUser) {
      return Response.json({ error: "Invalid GitHub token" }, { status: 401 });
    }

    const now = new Date().toISOString();

    const existing: any = await env.DB.prepare(
      "SELECT id, tier FROM users WHERE github_id = ?"
    ).bind(String(githubUser.id)).first();

    let userId: string;
    let tier: string;

    if (existing) {
      userId = existing.id;
      tier = existing.tier;

      await env.DB.prepare(`
        UPDATE users SET
          email = ?,
          github_username = ?,
          github_avatar_url = ?,
          github_name = ?,
          github_html_url = ?,
          github_company = ?,
          github_location = ?,
          github_bio = ?,
          github_followers = ?,
          github_twitter_username = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(
        githubUser.email || `${githubUser.login}@github`,
        githubUser.login,
        githubUser.avatar_url,
        githubUser.name,
        githubUser.html_url,
        githubUser.company,
        githubUser.location,
        githubUser.bio,
        githubUser.followers,
        githubUser.twitter_username,
        now,
        userId
      ).run();
    } else {
      userId = crypto.randomUUID();
      tier = "free";

      await env.DB.prepare(`
        INSERT INTO users (
          id, github_id, email, tier, created_at, updated_at,
          github_username, github_avatar_url, github_name, github_html_url, github_created_at,
          github_company, github_location, github_bio, github_followers, github_twitter_username
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        String(githubUser.id),
        githubUser.email || `${githubUser.login}@github`,
        tier,
        now,
        now,
        githubUser.login,
        githubUser.avatar_url,
        githubUser.name,
        githubUser.html_url,
        githubUser.created_at,
        githubUser.company,
        githubUser.location,
        githubUser.bio,
        githubUser.followers,
        githubUser.twitter_username
      ).run();
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT({ sub: userId, email: githubUser.email, tier })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return Response.json({ token });
  } catch (error) {
    console.error("Auth error:", error);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}

async function verifyGitHubToken(token: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Patchwork-Auth",
      },
    });

    if (!response.ok) return null;

    return response.json();
  } catch {
    return null;
  }
}
