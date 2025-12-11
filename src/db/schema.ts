import {
  boolean,
  timestamp,
  decimal,
  pgSchema,
  serial,
  text,
  integer,
  unique,
} from 'drizzle-orm/pg-core';

export const compassSchema = pgSchema('compass');

export const usersTable = compassSchema.table('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  isNative: boolean('is_native').notNull().default(false),
});

export const postsTable = compassSchema.table('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: integer('created_by').references(() => usersTable.id),
});

export const votesTable = compassSchema.table(
  'votes',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .references(() => postsTable.id)
      .notNull(),
    votedBy: integer('voted_by')
      .references(() => usersTable.id)
      .notNull(),
    type: text('vote_type', { enum: ['UP', 'DOWN'] }).notNull(),
    votedAt: timestamp('voted_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    voteConstraint: unique('unique_vote_constraint').on(table.postId, table.votedBy),
  }),
);

export const recommendationTable = compassSchema.table('recommendations', {
  id: serial('id').primaryKey(),
  destination: text('destination').notNull(),
  noOfTravellers: integer('number_of_travellers').notNull(),
  budget: decimal('budget', { precision: 10, scale: 2 }).notNull(),
  noOfDays: integer('number_of_days').notNull(),
  rating: decimal('rating').notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
