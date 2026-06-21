export async function sendAlert(message: string, data?: Record<string, unknown>): Promise<void> {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const payload = data
    ? { text: message, attachments: [{ color: "#f4dfb6", fields: Object.entries(data).map(([k, v]) => ({ title: k, value: String(v), short: true })) }] }
    : { text: message };

  if (slackUrl) {
    try {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("[notifications] Slack send failed:", err);
    }
  } else {
    console.log("[ALERT]", message, data ?? "");
  }
}