import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const token = uuid();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    db.prepare(
      "INSERT INTO magic_links (id, email, token, expires_at) VALUES (?, ?, ?, ?)"
    ).run(uuid(), email.toLowerCase(), token, expiresAt);

    // In production, send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AI Radar <noreply@airadar.godigitalapps.com>",
          to: email.toLowerCase(),
          subject: "Sign in to AI Radar",
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">🎯 AI Radar</h2>
              <p>Click the link below to sign in:</p>
              <a href="${magicLink}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Sign In to AI Radar
              </a>
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                This link expires in 15 minutes. If you didn't request this, ignore this email.
              </p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Magic link sent! Check your email.",
      // In dev, return the link directly
      ...(process.env.NODE_ENV !== "production" && { magicLink }),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also handle GET for the login page redirect
export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sign In - AI Radar</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #0a0a0f; color: #e8e8ed; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { background: #12121a; border: 1px solid #1e1e2e; border-radius: 16px; padding: 40px; max-width: 400px; width: 100%; margin: 20px; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #71717a; margin-bottom: 24px; font-size: 14px; }
        label { display: block; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        input { width: 100%; background: #0a0a0f; border: 1px solid #1e1e2e; border-radius: 8px; padding: 10px 14px; color: #e8e8ed; font-size: 14px; outline: none; }
        input:focus { border-color: #6366f1; }
        button { width: 100%; background: #6366f1; color: white; border: none; border-radius: 8px; padding: 12px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 16px; }
        button:hover { background: #818cf8; }
        .msg { margin-top: 16px; padding: 12px; border-radius: 8px; font-size: 14px; display: none; }
        .success { background: rgba(34,197,94,0.1); color: #22c55e; }
        .error { background: rgba(239,68,68,0.1); color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🎯 Sign in to AI Radar</h1>
        <p class="subtitle">Enter your email to receive a magic link</p>
        <form id="form">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="you@company.com" required />
          <button type="submit">Send Magic Link</button>
        </form>
        <div id="msg" class="msg"></div>
      </div>
      <script>
        document.getElementById('form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const msg = document.getElementById('msg');
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
              msg.textContent = data.message + (data.magicLink ? ' Dev link: ' + data.magicLink : '');
              msg.className = 'msg success';
            } else {
              msg.textContent = data.error;
              msg.className = 'msg error';
            }
          } catch {
            msg.textContent = 'Something went wrong.';
            msg.className = 'msg error';
          }
          msg.style.display = 'block';
        });
      </script>
    </body>
    </html>
  `;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
