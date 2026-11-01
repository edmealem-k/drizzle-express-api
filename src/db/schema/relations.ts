import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
