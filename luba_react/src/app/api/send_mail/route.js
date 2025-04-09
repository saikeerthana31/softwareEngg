// app/api/send-mail/route.js
"use server";
import FormData from "form-data";
import Mailgun from "mailgun.js";

export async function POST(req) {
  const { subject, text } = await req.json();

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "YOUR_API_KEY_HERE",
  });

  try {
    const data = await mg.messages.create(
      "sandboxa2cf473bf70b404e8ed67cd111202118.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandboxa2cf473bf70b404e8ed67cd111202118.mailgun.org>",
        to: ["Lokesh Budda Sankar Narayan <lokesh.buddasn@gmail.com>"],
        subject: subject || "Lab Booking Update",
        text: text || "This is a test email from Mailgun.",
      }
    );

    return new Response(JSON.stringify({ message: "Email sent successfully", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ message: "Failed to send email", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}