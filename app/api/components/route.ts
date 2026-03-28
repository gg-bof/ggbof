import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { components } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const metadataOnly = url.searchParams.get('metadataOnly') === 'true';
        const db = getDb((process.env as any).DB);
        const allComponents = await db.select().from(components);

        return NextResponse.json(allComponents.map(comp => {
            const parsedData = JSON.parse(comp.data);
            const result: any = {
                ...comp,
                data: metadataOnly ? null : parsedData,
                authorName: parsedData.authorName || null,
                authorAvatar: parsedData.authorAvatar || null
            };
            if (metadataOnly) delete result.data;
            return result;
        }));
    } catch (error) {
        console.error('Failed to fetch components:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as any;
        const { id, name, description, type, isPrivate, thumbnail, data, authorName, authorAvatar } = body;

        const db = getDb((process.env as any).DB);
        
        // Ensure author info is preserved in the data blob
        const richData = {
            ...(typeof data === 'string' ? JSON.parse(data) : data),
            authorName,
            authorAvatar
        };

        await db.insert(components).values({
            id,
            name,
            description,
            type,
            isPrivate,
            thumbnail,
            data: JSON.stringify(richData),
            createdAt: new Date(),
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: components.id,
            set: {
                name,
                description,
                type,
                isPrivate,
                thumbnail,
                data: JSON.stringify(richData),
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to create/update component:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        console.log('API: Attempting to delete component with ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Missing component ID' }, { status: 400 });
        }

        const db = getDb((process.env as any).DB);
        const result = await db.delete(components).where(eq(components.id, id));

        console.log('API: Delete operation completed for ID:', id);

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Failed to delete component:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
