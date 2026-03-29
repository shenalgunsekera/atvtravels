import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, destination, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Only attempt email if credentials are configured
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;

    if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS && EMAIL_TO) {
      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT ?? 587),
        secure: false,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      await transporter.sendMail({
        from: `"ATV Travels Website" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        subject: `New Enquiry from ${name} — ${destination || "No destination specified"}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#0B1F3A;border-bottom:2px solid #C9A84C;padding-bottom:12px;">
              New Tour Enquiry — ATV Travels
            </h2>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;color:#1C2536;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;font-weight:600;color:#1C2536;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;font-weight:600;color:#1C2536;">${phone || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Destination</td><td style="padding:8px 0;font-weight:600;color:#1C2536;">${destination || "—"}</td></tr>
            </table>
            <div style="background:#f8f6f0;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.1em;">Message</p>
              <p style="color:#1C2536;margin:0;line-height:1.7;">${message.replace(/\n/g, "<br>")}</p>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
              Sent via ATV Travels website enquiry form
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
