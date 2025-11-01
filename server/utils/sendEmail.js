const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Crear transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Configurar opciones del mensaje
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Enviar email
  const info = await transporter.sendMail(message);

  console.log('Email enviado: %s', info.messageId);
  return info;
};

module.exports = sendEmail;