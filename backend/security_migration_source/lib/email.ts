import nodemailer from 'nodemailer';
import { prisma } from './prisma';

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'tu-email@gmail.com',
    pass: process.env.SMTP_PASS || 'tu-contraseña',
  },
});

export async function sendWelcomeEmail(
  email: string,
  nombre: string,
  password: string,
  usuario?: string
) {
  const asunto = 'Bienvenido a Pilates Lab - Credenciales de Acceso';

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Pilates Lab" <noreply@pilateslab.com>',
      to: email,
      subject: asunto,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Bienvenido a Pilates Lab</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Tu cuenta ha sido creada exitosamente. A continuación encontrarás tus credenciales de acceso:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contraseña temporal:</strong> ${password}</p>
          </div>
          <p style="color: #ef4444;"><strong>Importante:</strong> Por seguridad, deberás cambiar tu contraseña en tu primer inicio de sesión.</p>
          <p>Puedes acceder al sistema en: <a href="http://localhost:3000">http://localhost:3000</a></p>
          <br>
          <p>Saludos,<br>Equipo de Pilates Lab</p>
        </div>
      `,
    });

    console.log(`Email enviado exitosamente a ${email}`);

    // Registrar envío exitoso
    await prisma.segEmailLog.create({
      data: {
        destinatario: email,
        asunto,
        estado: 'EXITOSO',
        usuario_alta: usuario,
      },
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error enviando email:', errorMessage);

    // Registrar error de envío
    try {
      await prisma.segEmailLog.create({
        data: {
          destinatario: email,
          asunto,
          estado: 'ERROR',
          mensaje_error: errorMessage,
          usuario_alta: usuario,
        },
      });
    } catch (logError) {
      console.error('Error registrando log de email:', logError);
    }

    // No fallar la creación del usuario si el email falla
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  usuario?: string
) {
  const asunto = 'Recuperación de Contraseña - Pilates Lab';
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Pilates Lab" <noreply@pilateslab.com>',
      to: email,
      subject: asunto,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Para continuar, haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${resetLink}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <br>
          <p>Saludos,<br>Equipo de Pilates Lab</p>
        </div>
      `,
    });

    console.log(`Email de recuperación enviado a ${email}`);
    console.log(`Link de recuperación: ${resetLink}`); // Para desarrollo

    await prisma.segEmailLog.create({
      data: {
        destinatario: email,
        asunto,
        estado: 'EXITOSO',
        usuario_alta: usuario || 'system',
      },
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error enviando email de recuperación:', errorMessage);

    try {
      await prisma.segEmailLog.create({
        data: {
          destinatario: email,
          asunto,
          estado: 'ERROR',
          mensaje_error: errorMessage,
          usuario_alta: usuario || 'system',
        },
      });
    } catch (logError) {
      console.error('Error registrando log:', logError);
    }

    return false;
  }
}
