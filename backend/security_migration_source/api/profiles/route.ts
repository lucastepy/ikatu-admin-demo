import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const profiles = await prisma.segPer.findMany({
            include: { menu: true },
            orderBy: { cod_perfil: 'asc' },
        });
        return NextResponse.json(profiles);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener perfiles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre_perfil, cod_menu, usuario } = body;

        const newProfile = await prisma.segPer.create({
            data: {
                nombre_perfil,
                cod_menu,
                usuario_alta: usuario,
            },
        });

        return NextResponse.json(newProfile, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear perfil' }, { status: 500 });
    }
}
