# Drizzle ORM with Node.js, Express, and TypeScript: The Complete A-to-Z Guide

A comprehensive, production-ready reference manual for building scalable, type-safe REST APIs using **Drizzle ORM**, **Node.js**, **Express**, and **TypeScript**.

---

## Table of Contents

1. [Part 1 — Beginner: Project Setup & Modern TypeScript Configuration](#part-1--beginner-project-setup--modern-typescript-configuration)
2. [Part 2 — Beginner: Installing Drizzle & Setting Up the Driver](#part-2--beginner-installing-drizzle--setting-up-the-driver)
3. [Part 3 — Beginner: Defining Schemas & Data Types](#part-3--beginner-defining-schemas--data-types)
4. [Part 4 — Beginner: Migrations & Drizzle Studio](#part-4--beginner-migrations--drizzle-studio)
5. [Part 5 — Beginner: Basic CRUD with Express](#part-5--beginner-basic-crud-with-express)
6. [Part 6 — Intermediate: Relations (One-to-Many, Many-to-Many)](#part-6--intermediate-relations-one-to-many-many-to-many)
7. [Part 7 — Intermediate: Query Builder Deep Dive](#part-7--intermediate-query-builder-deep-dive)
8. [Part 8 — Intermediate: Schema Validation with Zod (`drizzle-zod`)](#part-8--intermediate-schema-validation-with-zod-drizzle-zod)
9. [Part 9 — Advanced: Transactions & Rollbacks](#part-9--advanced-transactions--rollbacks)
10. [Part 10 — Advanced: Connection Pooling, Prepared Statements & Performance](#part-10--advanced-connection-pooling-prepared-statements--performance)
11. [Part 11 — Advanced: Indexes, Constraints & Soft Deletes](#part-11--advanced-indexes-constraints--soft-deletes)
12. [Part 12 — Advanced: Authentication with JWT & Bcrypt](#part-12--advanced-authentication-with-jwt--bcrypt)
13. [Part 13 — Advanced: Automated Integration Testing with Vitest & Supertest](#part-13--advanced-automated-integration-testing-with-vitest--supertest)
14. [Part 14 — Advanced: Production Project Architecture](#part-14--advanced-production-project-architecture)
15. [Part 15 — Troubleshooting & Common Pitfalls](#part-15--troubleshooting--common-pitfalls)

---

## Part 1 — Beginner: Project Setup & Modern TypeScript Configuration

### 1.1 Why Drizzle ORM?
Drizzle is a lightweight, headless TypeScript ORM designed with a simple philosophy: **"If you know SQL, you know Drizzle."**
- **Zero code generation**: Types are inferred directly from TypeScript code.
- **No heavy runtime overhead**: Queries compile directly to native SQL strings with parameterized values.
- **Dialect parity**: Direct access to PostgreSQL, MySQL, and SQLite-specific SQL capabilities.

### 1.2 Initialize the Project
Create the project directory and package manifest:

```bash
mkdir drizzle-express-api
cd drizzle-express-api
pnpm init
```

Install core dependencies:
```bash
# Runtime dependencies
pnpm add express dotenv

# Dev dependencies
pnpm add -D typescript tsx @types/node @types/express
```

### 1.3 Recommended TypeScript Configuration (`tsconfig.json`)
Modern TypeScript configurations often face issues between Node's native ESM loader (which requires `.js` extensions on relative imports) and developer ergonomics. 

To enable extensionless imports (`import { users } from "./users"`) and clean index resolution (`import * as schema from "./schema"`), use `"moduleResolution": "bundler"`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "outDir": "dist"
  },
  "include": ["src/**/*", "drizzle.config.ts"]
}
```

> **Key Flags Explained:**
> - `"types": ["node"]`: Explicitly loads Node.js globals (`process`, `Buffer`) even when using isolated package managers like `pnpm`.
> - `"moduleResolution": "bundler"`: Enables clean imports without writing explicit `.js` extensions in your source code.
> - `"noUncheckedIndexedAccess": true`: Enforces safety on array index lookups and dynamic dictionary keys by typing them as `T | undefined`.

### 1.4 NPM Scripts in `package.json`
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "test": "vitest run"
  }
}
```

---

## Part 2 — Beginner: Installing Drizzle & Setting Up the Driver

### 2.1 Installing Drizzle and Drivers
Drizzle separates the ORM core from database drivers and the migration CLI (`drizzle-kit`):

```bash
# For PostgreSQL (using the high-performance 'postgres' driver):
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# (Alternative Drivers if not using Postgres)
# MySQL:   pnpm add drizzle-orm mysql2
# SQLite:  pnpm add drizzle-orm better-sqlite3 && pnpm add -D @types/better-sqlite3
```

### 2.2 Environment Variables (`.env`)
Create `.env` in your project root:
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/drizzle_express_db
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
NODE_ENV=development
```

### 2.3 Drizzle Configuration (`drizzle.config.ts`)
The `drizzle.config.ts` file tells `drizzle-kit` where your schemas live, where to write migration files, and how to connect to the database:

```typescript
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 2.4 Initializing the Database Client (`src/db/index.ts`)
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Configure connection pool client
export const client = postgres(connectionString, {
  max: 10,                 // Maximum connections in pool
  idle_timeout: 20,        // Close idle connections after 20 seconds
  connect_timeout: 10,     // Connection timeout in seconds
});

// Pass schema so the Relational Queries API (db.query) is enabled
export const db = drizzle(client, { schema });
```

---

## Part 3 — Beginner: Defining Schemas & Data Types

In Drizzle, schemas are declared using pure TypeScript functions matching your database dialect. For PostgreSQL, import columns and table builders from **`drizzle-orm/pg-core`**.

### 3.1 Common PostgreSQL Column Types Cheat Sheet

| Column Builder | SQL Type | Example Usage |
| :--- | :--- | :--- |
| `serial("id")` | `SERIAL` (auto-incrementing int) | Primary keys |
| `integer("age")` | `INTEGER` | Whole numbers, counts, foreign keys |
| `varchar("name", { length: 100 })` | `VARCHAR(100)` | Names, titles, emails, passwords |
| `text("content")` | `TEXT` | Long descriptions, blog bodies |
| `boolean("is_active")` | `BOOLEAN` | Flags, status toggles |
| `timestamp("created_at")` | `TIMESTAMP` | Timestamps with `.defaultNow()` |
| `numeric("price", { precision: 10, scale: 2 })` | `NUMERIC(10, 2)` | Financial figures, accurate decimals |
| `jsonb("metadata")` | `JSONB` | Structured payloads with JSON querying |
| `uuid("id")` | `UUID` | UUID identifiers (`.defaultRandom()`) |

### 3.2 Defining the Users Table (`src/db/schema/users.ts`)
```typescript
import { pgTable, serial, varchar, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Soft delete support
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

// Infer TypeScript types from table schema
export type User = typeof users.$inferSelect;          // Type for queried rows
export type NewUser = typeof users.$inferInsert;       // Type for inserting new rows
```

### 3.3 Defining the Posts Table (`src/db/schema/posts.ts`)
```typescript
import { pgTable, serial, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  published: boolean("published").default(false).notNull(),
  authorId: integer("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### 3.4 Schema Barrel Export (`src/db/schema/index.ts`)
Always export all schemas and relations from a single entry file:
```typescript
export * from "./users";
export * from "./posts";
export * from "./relations";
export * from "./validators";
```

---

## Part 4 — Beginner: Migrations & Drizzle Studio

Drizzle supports two workflow modes:
1. **Migrations (Recommended for Production)**: Generates deterministic SQL migration files that can be reviewed, version-controlled, and audited.
2. **Push (Prototyping)**: Synchronizes schema directly to the database without generating SQL files.

### 4.1 Generating Migrations
Run:
```bash
pnpm db:generate
```
Drizzle Kit compares your TypeScript schema against the previous snapshot in `./drizzle/meta` and produces an incremental SQL file (e.g. `./drizzle/0000_init.sql`).

### 4.2 Applying Migrations
Apply generated migrations to the database:
```bash
pnpm db:migrate
```

You can also run migrations programmatically inside server startup or CI/CD pipelines:
```typescript
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, client } from "./src/db";

async function runMigration() {
  console.log("Applying migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
  await client.end();
}

runMigration().catch(console.error);
```

### 4.3 Drizzle Studio
Drizzle Studio provides an interactive web-based database explorer directly in your browser:
```bash
pnpm db:studio
```
Navigate to `https://local.drizzle.studio` to inspect tables, view foreign key relationships, insert test data, and edit records visually.

---

## Part 5 — Beginner: Basic CRUD with Express

### 5.1 User Controller (`src/controllers/user.controller.ts`)
```typescript
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, isNull } from "drizzle-orm";

// CREATE: Insert a new user
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, passwordHash } = req.body;

    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

// READ ALL: Retrieve active users
export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt));

    res.json({ success: true, data: allUsers });
  } catch (error) {
    next(error);
  }
};

// READ ONE: Retrieve single user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// UPDATE: Modify user record
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, id))
      .returning({ id: users.id, name: users.name, email: users.email });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// DELETE: Soft delete a user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const [deletedUser] = await db
      .update(users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User soft deleted successfully" });
  } catch (error) {
    next(error);
  }
};
```

### 5.2 User Router (`src/routes/users.route.ts`)
```typescript
import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

export const userRoutes = Router();

userRoutes.post("/", createUser);
userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUserById);
userRoutes.put("/:id", requireAuth, updateUser);
userRoutes.delete("/:id", requireAuth, deleteUser);
```

---

## Part 6 — Intermediate: Relations (One-to-Many, Many-to-Many)

Drizzle provides a **Relational Queries API (`db.query`)** on top of its SQL query builder. When relations are declared, you can fetch deeply nested object graphs in a single query without manually crafting SQL `JOIN` statements.

### 6.1 One-to-Many Relations (`src/db/schema/relations.ts`)
```typescript
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

// One user has many posts
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// One post belongs to one author (user)
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### 6.2 Querying One-to-Many with `db.query`
```typescript
// Fetch user with all their published posts
const userWithPosts = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, 1),
  columns: {
    passwordHash: false, // Omit sensitive columns
  },
  with: {
    posts: {
      where: (posts, { eq }) => eq(posts.published, true),
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 10,
    },
  },
});
```

### 6.3 Many-to-Many Relations (Junction Tables)
For groups and users:
```typescript
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

// Junction Table with Composite Primary Key
export const usersToGroups = pgTable(
  "users_to_groups",
  {
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    groupId: integer("group_id")
      .references(() => groups.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  })
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
}));
```

Querying groups for a specific user:
```typescript
const userGroups = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, 1),
  with: {
    usersToGroups: {
      with: {
        group: true,
      },
    },
  },
});
```

---

## Part 7 — Intermediate: Query Builder Deep Dive

When you need granular control over SQL operators, subqueries, complex joins, or aggregations, use Drizzle's standard SQL Query Builder (`db.select()`).

### 7.1 Operators Reference (`drizzle-orm`)
```typescript
import {
  eq,        // Equal: eq(col, val)
  ne,        // Not Equal: ne(col, val)
  gt,        // Greater Than: gt(col, val)
  gte,       // Greater Than or Equal: gte(col, val)
  lt,        // Less Than: lt(col, val)
  lte,       // Less Than or Equal: lte(col, val)
  like,      // Case-sensitive pattern: like(col, "%text%")
  ilike,     // Case-insensitive pattern: ilike(col, "%text%")
  inArray,   // IN list: inArray(col, [1, 2, 3])
  notInArray,// NOT IN list: notInArray(col, [1, 2, 3])
  isNull,    // IS NULL: isNull(col)
  isNotNull, // IS NOT NULL: isNotNull(col)
  between,   // BETWEEN: between(col, min, max)
  and,       // Logical AND: and(cond1, cond2)
  or,        // Logical OR: or(cond1, cond2)
  not,       // Logical NOT: not(cond)
} from "drizzle-orm";
```

### 7.2 Complex Filter Example
```typescript
const searchResults = await db
  .select()
  .from(posts)
  .where(
    and(
      eq(posts.published, true),
      or(
        ilike(posts.title, "%typescript%"),
        ilike(posts.content, "%drizzle%")
      ),
      between(posts.createdAt, new Date("2026-01-01"), new Date())
    )
  )
  .orderBy(desc(posts.createdAt))
  .limit(20)
  .offset(0);
```

### 7.3 Manual SQL Joins
```typescript
const postWithAuthor = await db
  .select({
    postId: posts.id,
    postTitle: posts.title,
    authorName: users.name,
    authorEmail: users.email,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true));
```

### 7.4 Aggregations & Group By
```typescript
import { count, avg, max, sql } from "drizzle-orm";

const authorStats = await db
  .select({
    authorId: posts.authorId,
    totalPosts: count(posts.id),
  })
  .from(posts)
  .groupBy(posts.authorId)
  .having(({ totalPosts }) => gt(totalPosts, 5));
```

### 7.5 Raw SQL Escape Hatch (`sql`)
If Drizzle does not yet have a specialized wrapper for a specific database function:
```typescript
import { sql } from "drizzle-orm";

// Custom raw SQL expression
const result = await db.select({
  id: users.id,
  lowerEmail: sql<string>`LOWER(${users.email})`,
  postCount: sql<number>`(SELECT COUNT(*) FROM ${posts} WHERE ${posts.authorId} = ${users.id})`,
}).from(users);
```

---

## Part 8 — Intermediate: Schema Validation with Zod (`drizzle-zod`)

Instead of writing separate Zod schemas and keeping them in sync manually with database changes, `drizzle-zod` derives validation schemas directly from table definitions.

### 8.1 Setup
```bash
pnpm add zod drizzle-zod
```

### 8.2 Generate Schemas (`src/db/schema/validators.ts`)
```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { posts } from "./posts";
import { z } from "zod";

// Schema for validating data when inserting a user
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Please provide a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
}).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

// Schema for validating data returned from database
export const selectUserSchema = createSelectSchema(users);

// Post insert validator
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});
```

### 8.3 Using Zod Schemas in Controllers
```typescript
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const result = insertUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const [created] = await db.insert(users).values(result.data).returning();
  res.status(201).json({ success: true, data: created });
};
```

---

## Part 9 — Advanced: Transactions & Rollbacks

Transactions guarantee that multiple dependent write operations either all commit successfully, or all rollback automatically if an error occurs.

### 9.1 Basic Transaction
```typescript
import { db } from "../db";
import { users, posts } from "../db/schema";
import { sql } from "drizzle-orm";

export async function createUserWithInitialPost(
  userData: { name: string; email: string; passwordHash: string },
  initialPostTitle: string
) {
  return await db.transaction(async (tx) => {
    // Step 1: Create User
    const [newUser] = await tx
      .insert(users)
      .values(userData)
      .returning();

    if (!newUser) {
      throw new Error("Failed to insert user in transaction");
    }

    // Step 2: Create initial welcome post
    const [newPost] = await tx
      .insert(posts)
      .values({
        title: initialPostTitle,
        content: "Welcome to my profile!",
        authorId: newUser.id,
        published: true,
      })
      .returning();

    // If an exception is thrown anywhere here, both statements roll back automatically!
    return { user: newUser, post: newPost };
  });
}
```

### 9.2 Nested Transactions & Savepoints
Drizzle supports nested transactions via SQL savepoints:
```typescript
await db.transaction(async (tx) => {
  await tx.insert(users).values(userA);

  try {
    await tx.transaction(async (nestedTx) => {
      await nestedTx.insert(users).values(userB);
      throw new Error("Rollback userB only");
    });
  } catch (err) {
    console.log("Nested transaction rolled back, parent continues");
  }

  // userA will still commit!
});
```

---

## Part 10 — Advanced: Connection Pooling, Prepared Statements & Performance

### 10.1 PostgreSQL Connection Pool Configuration
When running an Express API under production traffic, configure connection limits:

```typescript
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, {
  max: 20,                // Size of connection pool
  idle_timeout: 30,       // Seconds before closing idle connections
  connect_timeout: 10,    // Connect timeout in seconds
  prepare: false,         // Set to false if connecting through PgBouncer in transaction mode
});

export const db = drizzle(client, { schema });
```

### 10.2 Prepared Statements
Prepared statements parse and plan the SQL query once on the database engine. Subsequent calls reuse the cached execution plan, eliminating compilation overhead:

```typescript
import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

// Define and prepare query once at startup
export const getUserByIdPrepared = db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder("userId")))
  .prepare("get_user_by_id");

// Execute hot-path query inside controller
export async function fetchUserFast(id: number) {
  const [user] = await getUserByIdPrepared.execute({ userId: id });
  return user;
}
```

---

## Part 11 — Advanced: Indexes, Constraints & Soft Deletes

### 11.1 Composite Indexes & Constraints
```typescript
import { pgTable, serial, integer, varchar, index, unique, uniqueIndex } from "drizzle-orm/pg-core";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id").notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    userId: integer("user_id").notNull(),
  },
  (table) => ({
    // Composite Index: Accelerates WHERE tenant_id = ? AND action = ?
    tenantActionIdx: index("audit_tenant_action_idx").on(table.tenantId, table.action),
    // Composite Unique Constraint: Enforces unique combination
    tenantUserUnq: unique("audit_tenant_user_unq").on(table.tenantId, table.userId),
  })
);
```

### 11.2 Soft Delete Query Helpers
Never permanently remove user data when soft deletion is enabled:

```typescript
import { isNull, eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

// Soft delete
export const softDeleteUser = async (id: number) => {
  return await db
    .update(users)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(users.id, id));
};

// Query excluding soft-deleted records
export const findActiveUsers = async () => {
  return await db
    .select()
    .from(users)
    .where(isNull(users.deletedAt));
};
```

---

## Part 12 — Advanced: Authentication with JWT & Bcrypt

### 12.1 Authentication Controller (`src/controllers/auth.controller.ts`)
```typescript
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;

// REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};
```

### 12.2 Authentication Middleware (`src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || !JWT_SECRET) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  try {
    // Cast via unknown to safely assert user payload type
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

---

## Part 13 — Advanced: Automated Integration Testing with Vitest & Supertest

### 13.1 Test Database Environment (`.env.test`)
Always test against a dedicated test database:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/drizzle_express_test
JWT_SECRET=test_secret_for_vitest_runner_123456
NODE_ENV=test
```

### 13.2 Database Reset Helper (`src/db/testSetup.ts`)
```typescript
import { db } from "./index";
import { users, posts } from "./schema";

export const resetTestDb = async () => {
  await db.delete(posts);
  await db.delete(users);
};
```

### 13.3 Writing Integration Tests (`src/controllers/user.controller.test.ts`)
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { userRoutes } from "../routes/users.route";
import { resetTestDb } from "../db/testSetup";

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("User Routes Integration", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("should create a new user successfully", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "Test User",
        email: "tester@example.com",
        passwordHash: "dummyhash123",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe("tester@example.com");
    expect(response.body.data.id).toBeDefined();
  });

  it("should return 404 when querying an unknown user", async () => {
    const response = await request(app).get("/api/users/99999");
    expect(response.status).toBe(404);
  });
});
```

---

## Part 14 — Advanced: Production Project Architecture

A battle-tested directory structure:

```
drizzle-express-api/
├── .env                       # Local secrets (git ignored)
├── .env.example               # Template for environment variables
├── .env.test                  # Test environment variables
├── .gitignore
├── drizzle.config.ts          # Drizzle kit migration config
├── drizzle/                   # Auto-generated SQL migrations and snapshots
│   ├── 0000_init.sql
│   └── meta/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               # Application entry point & Express setup
    ├── controllers/           # HTTP Request & Response handlers
    │   ├── auth.controller.ts
    │   ├── user.controller.ts
    │   └── user.controller.test.ts
    ├── db/                    # Database client & schema definitions
    │   ├── index.ts           # Drizzle client instance & connection pool
    │   ├── testSetup.ts       # Database truncation/cleanup helper for tests
    │   └── schema/            # Database tables, relations, and validators
    │       ├── index.ts       # Barrel file
    │       ├── users.ts
    │       ├── posts.ts
    │       ├── relations.ts
    │       └── validators.ts
    ├── middleware/            # Express middlewares
    │   ├── auth.ts            # JWT verification
    │   └── errorHandler.ts    # Global exception handler
    └── routes/                # Express Route handlers
        ├── auth.route.ts
        └── users.route.ts
```

### Global Error Handling Middleware (`src/middleware/errorHandler.ts`)
```typescript
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Unhandled Error:", err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
```

---

## Part 15 — Troubleshooting & Common Pitfalls

### 1. `Cannot find name 'process'` (TS2591)
* **Cause**: `tsconfig.json` has `"types": []` or fails to include `@types/node` in pnpm workspaces.
* **Fix**: Ensure `"types": ["node"]` is declared in `compilerOptions` in `tsconfig.json`.

### 2. `Relative import paths need explicit file extensions... (TS2835)`
* **Cause**: Using `"moduleResolution": "nodenext"`. Node ESM requires `.js` on all relative imports.
* **Fix**: Change `"moduleResolution": "bundler"` in `tsconfig.json` and use `tsx` / `tsup` for development and production bundling.

### 3. `Argument of type 'ExtraConfigColumn<...>' is not assignable...` (Index error)
* **Cause**: Accidentally auto-importing `index` from `drizzle-orm/gel-core` (or `mysql-core`, `sqlite-core`) instead of `drizzle-orm/pg-core`.
* **Fix**: Always import table definitions and indexes from the matching dialect package:
  ```typescript
  import { index, pgTable } from "drizzle-orm/pg-core";
  ```

### 4. `Conversion of type 'Jwt & JwtPayload & void' to type '{ userId: number }' may be a mistake (TS2352)`
* **Cause**: Strict TypeScript type-assertion restrictions on `jwt.verify` return types, exacerbated when `token` is `string | undefined`.
* **Fix**: Guard against `undefined` tokens (`if (!token) return ...`) and cast through `unknown`:
  ```typescript
  const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: number };
  ```

### 5. `relation "users" does not exist` at runtime
* **Cause**: Migrations have not been applied to the database pointed to by `DATABASE_URL`.
* **Fix**:
  ```bash
  pnpm db:generate
  pnpm db:migrate
  ```

### 6. Connection Timeout in Production (Serverless / AWS Lambda / Neon)
* **Cause**: Default connection pool keeps connections open until timeout, exhausting pool limits in serverless environments.
* **Fix**: When using serverless backends or connection poolers (PgBouncer), configure `prepare: false` and use transaction mode or HTTP drivers (e.g. `@neondatabase/serverless`).

