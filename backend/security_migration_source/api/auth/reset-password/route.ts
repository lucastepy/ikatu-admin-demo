import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Buscar usuario por token y verificar expiración
        const user = await prisma.segUsu.findFirst({
            where: {
                reset_token: token,
                reset_token_expiry: {
                    gt: new Date(), // Expiración mayor a ahora
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 400 }
            );
        }

        // Hash de nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar usuario
        await prisma.segUsu.update({
            where: { email: user.email },
            data: {
                password: hashedPassword,
                reset_token: null,
                reset_token_expiry: null,
                primer_ingreso: false, // Ya cambió su contraseña
            },
        });

        return NextResponse.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error en reset-password:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
