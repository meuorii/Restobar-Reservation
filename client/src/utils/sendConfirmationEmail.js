import emailjs from "@emailjs/browser";

export const sendConfirmationEmail = ({
  to_name,
  to_email,
  date,
  start_time,
  end_time,
  table_id,
}) => {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_CONFIRM_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_CONFIRM_TEMPLATE_ID,
    {
      to_name,
      to_email,
      date,
      start_time,
      end_time,
      table_id,
    },
    import.meta.env.VITE_EMAILJS_CONFIRM_PUBLIC_KEY
  );
};
