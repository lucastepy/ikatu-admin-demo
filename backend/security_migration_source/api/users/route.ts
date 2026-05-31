import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.segUsu.findMany({
            include: { perfil: true },
            orderBy: { nombre: 'asc' },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, nombre, fecha_nacimiento, telefono, cod_perfil, estado, usuario } = body;

        // Importar dinámicamente para evitar errores de compilación
        const { hashPassword, DEFAULT_PASSWORD } = await import('@/lib/password');
        const { sendWelcomeEmail } = await import('@/lib/email');

        // Encriptar contraseña por defecto
        const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

        const newUser = await prisma.segUsu.create({
            data: {
                email,
                nombre,
                fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                telefono,
                cod_perfil,
                estado: estado || 'A',
                password: hashedPassword,
                primer_ingreso: true,
                usuario_alta: usuario,
            },
        });

        // Enviar correo con credenciales (no esperar respuesta)
        sendWelcomeEmail(email, nombre, DEFAULT_PASSWORD, usuario).catch(console.error);

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }
}
