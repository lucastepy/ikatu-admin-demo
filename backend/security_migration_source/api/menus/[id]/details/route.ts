import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const menuId = parseInt(id);

        if (isNaN(menuId)) {
            return NextResponse.json({ error: 'Invalid menu ID' }, { status: 400 });
        }

        const details = await prisma.segMnud.findMany({
            where: { cod_menu: menuId },
            orderBy: [
                { det_orden: 'asc' },
                { cod_detalle: 'asc' }
            ],
        });
        return NextResponse.json(details);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching menu details' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id);
        const body = await request.json();
        const { nombre, url, icono, cod_menu_padre, det_orden, estado, usuario } = body;

        // Calcular el siguiente cod_detalle para este menú
        const lastDetail = await prisma.segMnud.findFirst({
            where: { cod_menu: id },
            orderBy: { cod_detalle: 'desc' },
        });

        const nextCodDetalle = (lastDetail?.cod_detalle || 0) + 1;

        const newDetail = await prisma.segMnud.create({
            data: {
                cod_menu: id,
                cod_detalle: nextCodDetalle,
                nombre,
                url,
                icono,
                cod_menu_padre,
                det_orden: det_orden || 0,
                estado,
                usuario_alta: usuario,
            },
        });

        return NextResponse.json(newDetail, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating menu detail' }, { status: 500 });
    }
}
