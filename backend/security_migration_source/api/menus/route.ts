import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const menus = await prisma.segMnu.findMany({
            orderBy: { cod_menu: 'asc' },
        });
        return NextResponse.json(menus);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener menús' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre_menu, usuario } = body;

        const newMenu = await prisma.segMnu.create({
            data: {
                nombre_menu,
                usuario_alta: usuario,
            },
        });

        return NextResponse.json(newMenu, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear menú' }, { status: 500 });
    }
}
