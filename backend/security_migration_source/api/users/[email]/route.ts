import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const email = (await params).email;
        const body = await request.json();
        const { nombre, fecha_nacimiento, telefono, cod_perfil, estado, usuario } = body;

        const updatedUser = await prisma.segUsu.update({
            where: { email },
            data: {
                nombre,
                fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                telefono,
                cod_perfil,
                estado,
                usuario_mod: usuario,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const email = (await params).email;
        await prisma.segUsu.delete({
            where: { email },
        });

        return NextResponse.json({ message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}
