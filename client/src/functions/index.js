import functions from "firebase-functions";
import admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();

const RECAPTCHA_SECRET = functions.config().recaptcha.secret;

export const verifyRecaptcha = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Missing reCAPTCHA token" });
  }

  try {
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`;
    const response = await fetch(verifyURL, { method: "POST" });
    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: "Invalid reCAPTCHA" });
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(500).json({ success: false, message: "reCAPTCHA verification failed" });
  }
});
