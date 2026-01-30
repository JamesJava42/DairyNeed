// lib/mailer.ts
import nodemailer from "nodemailer";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function createTransport() {
  const host = mustEnv("SMTP_HOST");
  const port = Number(mustEnv("SMTP_PORT"));
  const secure = String(process.env.SMTP_SECURE ?? "true") === "true";

  const user = mustEnv("SMTP_USER");
  const pass = mustEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * ✅ Named export used by /api/orders/route.ts
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transporter = createTransport();

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@example.com";

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? "",
  });
}
