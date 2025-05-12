import emailjs from "@emailjs/browser";

export const sendRejectionEmail = async ({
  to_name,
  to_email,
  date,
  start_time,
  end_time,
}) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_REJECT_SERVICE_ID,     // your rejection service ID
      import.meta.env.VITE_EMAILJS_REJECT_TEMPLATE_ID,    // your rejection template ID
      {
        to_name,
        to_email,
        date,
        start_time,
        end_time,
      },
      import.meta.env.VITE_EMAILJS_REJECT_PUBLIC_KEY       // your public key
    );
  } catch (error) {
    console.error("❌ Rejection email failed to send:", error);
  }
};
