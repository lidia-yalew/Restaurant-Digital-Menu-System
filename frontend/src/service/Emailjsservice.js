// src/utils/emailService.js
import emailjs from "@emailjs/browser";

const SERVICE_ID  = "your_service_id";   // from EmailJS dashboard
const TEMPLATE_ID = "your_template_id";
const PUBLIC_KEY  = "your_public_key";

export const sendReservationConfirmation = async ({ name, email, date, time, guests }) => {
  const templateParams = {
    to_email: email,
    name,
    date,
    time,
    guests,
  };

  const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  return response;
};
