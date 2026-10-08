// Server-only: adds an email to your list. Pick a provider with EMAIL_PROVIDER.
// Keys stay on the server; the browser only ever talks to /api/subscribe.

export type SubscribeInput = { email: string; source: string };
export type SubscribeResult = { ok: true } | { ok: false; status: number; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_RE.test(email);
}

async function kit({ email, source }: SubscribeInput) {
  const key = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!key || !formId) return notConfigured("KIT_API_KEY and KIT_FORM_ID");
  const headers = { "X-Kit-Api-Key": key, "Content-Type": "application/json" };
  // 1) upsert the subscriber, 2) add them to the form. The form's incentive
  //    email / automation in Kit is what delivers the GitHub link.
  const created = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address: email }),
  });
  if (!created.ok) return upstream("Kit", created);
  const added = await fetch(`https://api.kit.com/v4/forms/${formId}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address: email, referrer: source }),
  });
  if (!added.ok) return upstream("Kit", added);
  return { ok: true } as const;
}

async function beehiiv({ email, source }: SubscribeInput) {
  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) return notConfigured("BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID");
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      utm_source: source,
      send_welcome_email: true, // put the GitHub link in your welcome email
      reactivate_existing: false,
    }),
  });
  if (!res.ok) return upstream("beehiiv", res);
  return { ok: true } as const;
}

// Anything else (Mailchimp via Zapier/Make, a Google Sheet, your own backend).
async function webhook(input: SubscribeInput) {
  const url = process.env.EMAIL_WEBHOOK_URL;
  if (!url) return notConfigured("EMAIL_WEBHOOK_URL");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, subscribedAt: new Date().toISOString() }),
  });
  if (!res.ok) return upstream("webhook", res);
  return { ok: true } as const;
}

const providers = { kit, beehiiv, webhook };

export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const name = process.env.EMAIL_PROVIDER as keyof typeof providers | undefined;
  const provider = name && providers[name];
  if (!provider) return notConfigured("EMAIL_PROVIDER (kit | beehiiv | webhook)");
  try {
    return await provider(input);
  } catch (err) {
    console.error("[subscribe] network error", err);
    return { ok: false, status: 502, error: "Couldn't reach the email service. Try again." };
  }
}

function notConfigured(what: string): SubscribeResult {
  console.error(`[subscribe] not configured: set ${what}`);
  return { ok: false, status: 503, error: "Sign-ups aren't open yet. Check back soon." };
}

async function upstream(name: string, res: Response): Promise<SubscribeResult> {
  console.error(`[subscribe] ${name} ${res.status}`, await res.text().catch(() => ""));
  return { ok: false, status: 502, error: "Couldn't sign you up right now. Try again." };
}
