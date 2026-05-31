import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'El email es requerido' },
                { status: 400 }
            );
        }

        // Buscar usuario
        const user = await prisma.segUsu.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Email no registrado' },
                { status: 404 }
            );
        }

        if (user.estado !== 'A') {
            return NextResponse.json(
                { error: 'Usuario inactivo' },
                { status: 403 }
            );
        }

        // Generar token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1); // 1 hora de validez

        // Guardar token en base de datos
        await prisma.segUsu.update({
            where: { email },
            data: {
                reset_token: token,
                reset_token_expiry: expiry,
            },
        });

        // Enviar email
        const emailSent = await sendPasswordResetEmail(email, token, user.nombre);

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Error al enviar el email de recuperación' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' });

    } catch (error) {
        console.error('Error en forgot-password:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
