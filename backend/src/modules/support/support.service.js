const mailer = require('../../utils/mailer');

async function sendContactMessage({ name, email, subject, message }) {
  await mailer.sendEmail({
    subject: `[Contact Support] ${subject}`,
    text: `New message from the Contact Support form:\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
    replyTo: email,
  });
}

module.exports = { sendContactMessage };
