"use server";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { subject, text } = req.body;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "YOUR_API_KEY_HERE", // Store API key in environment variable
  });
  console.log(process.env.MAILGUN_API_KEY)
  try {
    const data = await mg.messages.create("sandboxa2cf473bf70b404e8ed67cd111202118.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxa2cf473bf70b404e8ed67cd111202118.mailgun.org>",
      to: ["Lokesh Budda Sankar Narayan <lokesh.buddasn@gmail.com>"],
      subject: subject || "Lab Booking Update",
      text: text || "This is a test email from Mailgun.",
    });

    return res.status(200).json({ message: "Email sent successfully", data });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send email", error: error.message });
  }
}