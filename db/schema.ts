import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const components = sqliteTable('components', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').default('artifact'), // 'artifact' | 'situation'
    type: text('type').notNull(), // 'free' | 'paid'
    isPrivate: integer('is_private', { mode: 'boolean' }).notNull().default(false),
    thumbnail: text('thumbnail'),
    authorName: text('author_name'),
    authorAvatar: text('author_avatar'),
    data: text('data').notNull(), // JSON string of nodes and edges
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
