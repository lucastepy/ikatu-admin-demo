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
            return NextResponse.json({ error: 'ID de menú inválido' }, { status: 400 });
        }

        // Obtener todos los detalles del menú activos
        const details = await prisma.segMnud.findMany({
            where: {
                cod_menu: menuId,
                estado: 'A',
            },
            orderBy: [
                { det_orden: 'asc' },
                { cod_detalle: 'asc' }
            ],
        });

        // Construir jerarquía
        const map: { [key: number]: any } = {};
        const roots: any[] = [];

        // Primero mapear todos los nodos
        details.forEach((detail) => {
            map[detail.cod_detalle] = { ...detail, children: [] };
        });

        // Luego armar el árbol
        details.forEach((detail) => {
            if (detail.cod_menu_padre && map[detail.cod_menu_padre]) {
                map[detail.cod_menu_padre].children.push(map[detail.cod_detalle]);
            } else {
                roots.push(map[detail.cod_detalle]);
            }
        });

        return NextResponse.json(roots);
    } catch (error) {
        console.error('Error al obtener estructura del menú:', error);
        return NextResponse.json(
            { error: 'Error al obtener estructura del menú' },
            { status: 500 }
        );
    }
}
