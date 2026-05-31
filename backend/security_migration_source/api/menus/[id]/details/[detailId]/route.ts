import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; detailId: string }> }
) {
    try {
        const { id, detailId } = await params;
        const cod_menu = parseInt(id);
        const cod_detalle = parseInt(detailId);

        const detail = await prisma.segMnud.findUnique({
            where: {
                cod_menu_cod_detalle: {
                    cod_menu,
                    cod_detalle,
                },
            },
        });

        if (!detail) {
            return NextResponse.json({ error: 'Detalle de menú no encontrado' }, { status: 404 });
        }

        return NextResponse.json(detail);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener detalle de menú' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string; detailId: string }> }
) {
    try {
        const { id, detailId } = await params;
        const cod_menu = parseInt(id);
        const cod_detalle = parseInt(detailId);
        const body = await request.json();
        const { nombre, url, icono, cod_menu_padre, det_orden, estado, usuario } = body;

        const updatedDetail = await prisma.segMnud.update({
            where: {
                cod_menu_cod_detalle: {
                    cod_menu,
                    cod_detalle,
                },
            },
            data: {
                nombre,
                url,
                icono,
                cod_menu_padre,
                det_orden: det_orden || 0,
                estado,
                usuario_mod: usuario,
            },
        });

        return NextResponse.json(updatedDetail);
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar detalle de menú' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; detailId: string }> }
) {
    try {
        const { id, detailId } = await params;
        const cod_menu = parseInt(id);
        const cod_detalle = parseInt(detailId);

        await prisma.segMnud.delete({
            where: {
                cod_menu_cod_detalle: {
                    cod_menu,
                    cod_detalle,
                },
            },
        });

        return NextResponse.json({ message: 'Detalle de menú eliminado' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar detalle de menú' }, { status: 500 });
    }
}
