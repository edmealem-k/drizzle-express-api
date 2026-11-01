# Drizzle Express API

A production-grade REST API built with **Express 5**, **TypeScript**, and **Drizzle ORM** connected to **PostgreSQL**.

---

## Features

- **End-to-End Type Safety**: Inferred TypeScript types across models, query results, and API payloads without code generation.
- **Drizzle ORM & PostgreSQL**: High-performance database client using the `postgres` (postgres-js) driver with connection pooling.
- **Relational & SQL Query Builder**: Nested relationship queries (`db.query`) alongside standard SQL queries (`db.select`).
- **Data Validation**: Request validation powered by **Zod** and **`drizzle-zod`**.
- **JWT Authentication**: Secure user registration, password hashing with **bcryptjs**, and bearer token authentication middleware.
- **Automated Migrations**: Schema versioning and migrations managed via **Drizzle Kit**.
- **Visual DB Management**: Built-in visual database browser with **Drizzle Studio**.
- **Integration Testing**: Automated API integration tests using **Vitest** and **Supertest** against an isolated test database.
- **Centralized Error Handling**: Clean, consistent error handling middleware.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (executed with [tsx](https://github.com/privatenumber/tsx))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Migrations & CLI**: [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- **Database Driver**: [postgres (Postgres.js)](https://github.com/porsager/postgres)
- **Validation**: [Zod](https://zod.dev/) & [drizzle-zod](https://orm.drizzle.team/docs/zod)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Testing**: [Vitest](https://vitest.dev/) & [Supertest](https://github.com/ladjs/supertest)

---

## Project Structure

```
drizzle-express-api/
├── .env.example               # Environment variables template
├── .gitignore
├── drizzle.config.ts          # Drizzle Kit CLI configuration
├── drizzle/                   # Generated SQL migrations and metadata snapshots
├── docs/
│   └── drizzle-guide.md       # Comprehensive A-to-Z Drizzle reference manual
├── package.json
├── tsconfig.json              # Modern TypeScript bundler module resolution
└── src/
    ├── index.ts               # Express server entry point
    ├── controllers/           # API request controllers
    │   ├── auth.controller.ts
    │   ├── user.controller.ts
    │   └── user.controller.test.ts
    ├── db/                    # Database client & schema definitions
    │   ├── index.ts           # Drizzle connection instance with pool config
    │   ├── testSetup.ts       # Test DB reset & teardown utilities
    │   └── schema/            # Schema tables, relations, and validators
    │       ├── index.ts       # Schema barrel file
    │       ├── users.ts       # Users table definition & types
    │       ├── posts.ts       # Posts table definition & foreign keys
    │       ├── relations.ts   # One-to-many & many-to-many relations
    │       └── validators.ts  # Zod insert & select schemas
    ├── middleware/            # Express middlewares
    │   ├── auth.ts            # JWT authentication guard
    │   └── errorHandler.ts    # Global exception handler
    └── routes/                # Express router definitions
        ├── auth.route.ts
        └── users.route.ts
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **pnpm** (or npm / yarn)
- **PostgreSQL** instance running locally or via cloud (e.g., Neon, Supabase, Docker)

### 2. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd drizzle-express-api
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your credentials inside `.env`:
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/drizzle_express_db
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
NODE_ENV=development
```

### 4. Database Migrations
Generate SQL migration files from your TypeScript schema:
```bash
pnpm db:generate
```

Apply migrations to your PostgreSQL database:
```bash
pnpm db:migrate
```

*(Optional)* Launch Drizzle Studio to inspect and edit your database visually:
```bash
pnpm db:studio
```

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `pnpm dev` | `tsx watch src/index.ts` | Starts dev server with fast hot-reloading |
| `pnpm build` | `tsc` | Typechecks and compiles TypeScript to `dist/` |
| `pnpm start` | `node dist/index.js` | Runs compiled production server |
| `pnpm db:generate` | `drizzle-kit generate` | Generates incremental SQL migrations |
| `pnpm db:migrate` | `drizzle-kit migrate` | Applies pending migrations to the database |
| `pnpm db:studio` | `drizzle-kit studio` | Opens Drizzle Studio in your browser |
| `pnpm test` | `vitest run` | Runs automated test suite |

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all active users | No |
| `GET` | `/api/users/:id` | Get user details by ID | No |
| `POST` | `/api/users` | Create user directly | No |
| `PUT` | `/api/users/:id` | Update user details | **Yes** (Bearer Token) |
| `DELETE` | `/api/users/:id` | Soft delete user | **Yes** (Bearer Token) |

---

## Testing

Create a test database `.env.test` file:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/drizzle_express_test
JWT_SECRET=test_secret_for_vitest_runner_123456
NODE_ENV=test
```

Run tests with Vitest:
```bash
pnpm test
```

---

## Documentation

For a comprehensive, step-by-step tutorial covering everything from beginners' setup to advanced topics (Transactions, Relations, Connection Pooling, Performance Optimization, and Troubleshooting common errors), check out:

👉 **[Complete Drizzle ORM A-to-Z Guide](docs/drizzle-guide.md)**

