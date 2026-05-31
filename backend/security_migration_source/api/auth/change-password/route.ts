import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, currentPassword, newPassword } = body;

        if (!email || !currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Buscar usuario
        const user = await prisma.segUsu.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Verificar contraseña actual
        const isValid = await verifyPassword(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Contraseña actual incorrecta' },
                { status: 401 }
            );
        }

        // Encriptar nueva contraseña
        const hashedPassword = await hashPassword(newPassword);

        // Actualizar contraseña y marcar que ya no es primer ingreso
        await prisma.segUsu.update({
            where: { email },
            data: {
                password: hashedPassword,
                primer_ingreso: false,
                usuario_mod: email,
            },
        });

        return NextResponse.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return NextResponse.json(
            { error: 'Error al cambiar contraseña' },
            { status: 500 }
        );
    }
}
