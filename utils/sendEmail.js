const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Crear transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Definir opciones del email
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
  };

  // Enviar email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent: ' + info.messageId);
};

// Plantillas de email
const emailTemplates = {
  // Email de verificación de cuenta
  verification: (name, verificationUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verificación de cuenta - Swaply</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Swaply!</h1>
        </div>
        <div class="content">
          <h2>Hola ${name},</h2>
          <p>Gracias por registrarte en Swaply, la plataforma de intercambio de objetos más confiable.</p>
          <p>Para completar tu registro y comenzar a intercambiar, necesitas verificar tu dirección de email.</p>
          <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
          <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p>${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas por seguridad.</p>
          <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Swaply. Todos los derechos reservados.</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Email de recuperación de contraseña
  passwordReset: (name, resetUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recuperación de contraseña - Swaply</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recuperación de contraseña</h1>
        </div>
        <div class="content">
          <h2>Hola ${name},</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Swaply.</p>
          <div class="warning">
            <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá sin cambios.
          </div>
          <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
          <a href="${resetUrl}" class="button">Restablecer contraseña</a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p>${resetUrl}</p>
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <p>Si tienes problemas, contacta a nuestro equipo de soporte.</p>
        </div>
        <div class="footer">
          <p>© 2024 Swaply. Todos los derechos reservados.</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Email de notificación de nuevo mensaje
  newMessage: (recipientName, senderName, publicationTitle, messagePreview) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nuevo mensaje - Swaply</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .message-preview { background: white; padding: 15px; border-left: 4px solid #059669; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 Nuevo mensaje</h1>
        </div>
        <div class="content">
          <h2>Hola ${recipientName},</h2>
          <p>Tienes un nuevo mensaje de <strong>${senderName}</strong> sobre tu publicación:</p>
          <p><strong>"${publicationTitle}"</strong></p>
          <div class="message-preview">
            <p><em>"${messagePreview}"</em></p>
          </div>
          <p>Responde rápidamente para no perder la oportunidad de intercambio:</p>
          <a href="${process.env.CLIENT_URL}/messages" class="button">Ver mensaje</a>
        </div>
        <div class="footer">
          <p>© 2024 Swaply. Todos los derechos reservados.</p>
          <p>Puedes desactivar estas notificaciones en tu configuración de cuenta.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Email de notificación de nueva valoración
  newRating: (userName, raterName, rating, comment) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva valoración - Swaply</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .rating { text-align: center; font-size: 24px; margin: 20px 0; }
        .stars { color: #f59e0b; }
        .comment { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ Nueva valoración</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p><strong>${raterName}</strong> te ha dejado una nueva valoración:</p>
          <div class="rating">
            <div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
            <p>${rating}/5 estrellas</p>
          </div>
          ${comment ? `<div class="comment">"${comment}"</div>` : ''}
          <p>¡Felicitaciones! Las buenas valoraciones mejoran tu reputación en la plataforma.</p>
          <a href="${process.env.CLIENT_URL}/profile" class="button">Ver mi perfil</a>
        </div>
        <div class="footer">
          <p>© 2024 Swaply. Todos los derechos reservados.</p>
          <p>Puedes desactivar estas notificaciones en tu configuración de cuenta.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Email de propuesta de intercambio
  exchangeProposal: (recipientName, proposerName, publicationTitle, proposalDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Propuesta de intercambio - Swaply</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .proposal { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 Propuesta de intercambio</h1>
        </div>
        <div class="content">
          <h2>Hola ${recipientName},</h2>
          <p><strong>${proposerName}</strong> te ha enviado una propuesta de intercambio para tu publicación:</p>
          <p><strong>"${publicationTitle}"</strong></p>
          <div class="proposal">
            <h3>Detalles de la propuesta:</h3>
            <p>${proposalDetails}</p>
          </div>
          <p>Revisa la propuesta y responde lo antes posible:</p>
          <a href="${process.env.CLIENT_URL}/messages" class="button">Ver propuesta</a>
          <p>Recuerda que las propuestas tienen un tiempo límite de respuesta.</p>
        </div>
        <div class="footer">
          <p>© 2024 Swaply. Todos los derechos reservados.</p>
          <p>Puedes desactivar estas notificaciones en tu configuración de cuenta.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Email de bienvenida después de verificación
  welcome: (name) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>¡Bienvenido a Swaply!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .tips { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Cuenta verificada!</h1>
        </div>
        <div class="content">
          <h2>¡Hola ${name}!</h2>
          <p>Tu cuenta ha sido verificada exitosamente. ¡Ya puedes comenzar a intercambiar!</p>
          
          <div class="tips">
            <h3>💡 Consejos para empezar:</h3>
            <ul>
              <li>Completa tu perfil con una foto y descripción</li>
              <li>Publica tus primeros objetos para intercambiar</li>
              <li>Explora las publicaciones de otros usuarios</li>
              <li>Mantén una comunicación respetuosa</li>
              <li>Deja valoraciones después de cada intercambio</li>
            </ul>
          </div>
          
          <p>¿Qué te gustaría hacer primero?</p>
          <a href="${process.env.CLIENT_URL}/profile/edit" class="button">Completar perfil</a>
          <a href="${process.env.CLIENT_URL}/publications/create" class="button">Crear publicación</a>
          <a href="${process.env.CLIENT_URL}/explore" class="button">Explorar</a>
        </div>
        <div class="footer">
          <p>© 2024 Swaply. Todos los derechos reservados.</p>
          <p>Si tienes preguntas, visita nuestro centro de ayuda.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

module.exports = { sendEmail, emailTemplates };