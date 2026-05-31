import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, nombre, password } = await request.json();

        if (!email || !nombre || !password) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Bienvenido a Pilates Lab',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">¡Bienvenido a Pilates Lab!</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Tu cuenta ha sido creada exitosamente. A continuación encontrarás tus credenciales de acceso:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> ${password}</p>
                    </div>
                    <p style="color: #d9534f;"><strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña en el primer ingreso.</p>
                    <p>Puedes acceder al sistema en: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}</a></p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>Saludos,<br><strong>Equipo Pilates Lab</strong></p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Log email
        await prisma.segEmailLog.create({
            data: {
                destinatario: email,
                asunto: 'Bienvenido a Pilates Lab',
                estado: 'EXITOSO',
                usuario_alta: 'SISTEMA',
            },
        });

        return NextResponse.json({ message: 'Email enviado exitosamente' });
    } catch (error: any) {
        console.error('Error sending welcome email:', error);

        // Log failed email
        try {
            const { email } = await request.json();
            await prisma.segEmailLog.create({
                data: {
                    destinatario: email || 'unknown',
                    asunto: 'Bienvenido a Pilates Lab',
                    estado: 'ERROR',
                    mensaje_error: error.message,
                    usuario_alta: 'SISTEMA',
                },
            });
        } catch (logError) {
            console.error('Error logging email failure:', logError);
        }

        return NextResponse.json(
            { error: 'Error al enviar email' },
            { status: 500 }
        );
    }
}
