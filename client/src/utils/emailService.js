import emailjs from "@emailjs/browser";

export const sendReservationEmail = async ({
  to_name,
  to_email,
  message,
  date,
  start_time,
  end_time,
  table_id,
}) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_name,
        to_email,
        message,
        date,
        start_time,
        end_time,
        table_id,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error("EmailJS error:", error);
  }
};
