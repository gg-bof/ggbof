import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { components } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const metadataOnly = url.searchParams.get('metadataOnly') === 'true';
        const id = url.searchParams.get('id');
        const db = getDb((process.env as any).DB);

        if (id) {
            const result = await db.select().from(components).where(eq(components.id, id));
            if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            const comp = result[0];
            return NextResponse.json({
                ...comp,
                data: JSON.parse(comp.data)
            });
        }

        const allComponents = await db.select().from(components);

        return NextResponse.json(allComponents.map(comp => {
            const parsedData = JSON.parse(comp.data);
            const result: any = {
                ...comp,
                data: metadataOnly ? null : parsedData,
                authorName: comp.authorName || parsedData.authorName || null,
                authorAvatar: comp.authorAvatar || parsedData.authorAvatar || null
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
        const { 
            id, name, description, category, type, 
            isPrivate, thumbnail, data, authorName, authorAvatar 
        } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields: id and name are required' }, { status: 400 });
        }

        const db = getDb((process.env as any).DB);
        
        const richData = {
            ...(typeof data === 'string' ? JSON.parse(data) : data),
            authorName: authorName || 'Anonymous',
            authorAvatar: authorAvatar || ''
        };

        const finalValues = {
            id,
            name,
            description: description || '',
            category: category || 'artifact',
            type: type || 'free',
            isPrivate: isPrivate === true || isPrivate === 1,
            thumbnail: thumbnail || null,
            authorName: authorName || 'Anonymous',
            authorAvatar: authorAvatar || '',
            data: JSON.stringify(richData),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(components).values(finalValues).onConflictDoUpdate({
            target: components.id,
            set: {
                name: finalValues.name,
                description: finalValues.description,
                category: finalValues.category,
                type: finalValues.type,
                isPrivate: finalValues.isPrivate,
                thumbnail: finalValues.thumbnail,
                authorName: finalValues.authorName,
                authorAvatar: finalValues.authorAvatar,
                data: finalValues.data,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to create/update component:', error);
        const errorDetails = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            error: 'Database Error', 
            details: errorDetails,
            message: 'Check if the ID exists or if there is a schema mismatch.'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing component ID' }, { status: 400 });
        }

        const db = getDb((process.env as any).DB);
        const result = await db.delete(components).where(eq(components.id, id));

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Failed to delete component:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
