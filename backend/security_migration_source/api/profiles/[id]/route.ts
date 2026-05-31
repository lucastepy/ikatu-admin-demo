import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id);
        const body = await request.json();
        const { nombre_perfil, cod_menu, usuario } = body;

        const updatedProfile = await prisma.segPer.update({
            where: { cod_perfil: id },
            data: {
                nombre_perfil,
                cod_menu,
                usuario_mod: usuario,
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id);
        await prisma.segPer.delete({
            where: { cod_perfil: id },
        });

        return NextResponse.json({ message: 'Profile deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting profile' }, { status: 500 });
    }
}
