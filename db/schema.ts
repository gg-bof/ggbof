import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const components = sqliteTable('components', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type').notNull(), // 'free' | 'paid'
    isPrivate: integer('is_private', { mode: 'boolean' }).notNull().default(false),
    thumbnail: text('thumbnail'),
    data: text('data').notNull(), // JSON string of nodes and edges
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
