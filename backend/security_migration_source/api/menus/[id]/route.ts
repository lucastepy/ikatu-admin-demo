import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id);
        const menu = await prisma.segMnu.findUnique({
            where: { cod_menu: id },
            include: { detalles: true },
        });

        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        return NextResponse.json(menu);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching menu' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id);
        const body = await request.json();
        const { nombre_menu, usuario } = body;

        const updatedMenu = await prisma.segMnu.update({
            where: { cod_menu: id },
            data: {
                nombre_menu,
                usuario_mod: usuario,
            },
        });

        return NextResponse.json(updatedMenu);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating menu' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id);
        await prisma.segMnu.delete({
            where: { cod_menu: id },
        });

        return NextResponse.json({ message: 'Menu deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting menu' }, { status: 500 });
    }
}
