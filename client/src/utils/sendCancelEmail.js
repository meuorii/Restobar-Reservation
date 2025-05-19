import emailjs from "@emailjs/browser";

export const sendCancelEmail = ({
  to_name,
  to_email,
  date,
  start_time,
  end_time,
  table_id,
  guests,
}) => {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_CANCEL_SERVICE_ID,       // your EmailJS service ID
    import.meta.env.VITE_EMAILJS_CANCEL_TEMPLATE_ID,      // your cancel template ID
    {
      to_name,
      to_email,
      date,
      start_time,
      end_time,
      table_id,
      guests,
    },
    import.meta.env.VITE_EMAILJS_CANCEL_PUBLIC_KEY        // your public key
  );
};
