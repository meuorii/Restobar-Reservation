import emailjs from "@emailjs/browser";

export const sendReservationEmail = async ({
  to_name,
  to_email,
  date,
  start_time,
  end_time,
  table_id,
  guests,
  code,
}) => {
  try {
    const subject = `🍽️ Reservation for ${to_name} on ${date} – Please Confirm`;

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_name,
        to_email,
        subject,
        date,
        start_time,
        end_time,
        table_id,
        guests,
        code,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error("❌ EmailJS Error:", error);
  }
};
