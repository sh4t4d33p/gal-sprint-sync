# SprintSync Backend

## Overview
This folder contains the backend API for the SprintSync application. It is built with Express.js, TypeScript, Prisma ORM, and PostgreSQL. The backend provides authentication, user and task management, AI-powered task suggestions, analytics, and more.

---

## Features
- JWT authentication
- User and task CRUD
- Admin controls
- AI task suggestion endpoint
- Analytics endpoints
- Rate limiting and logging
- OpenAPI (Swagger) documentation
- Unit tests
- Docker support

---

## Installation & Setup

### 1. Clone the Repository
```sh
git clone https://github.com/sh4t4d33p/gal-sprint-sync.git
cd backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Environment Variables
Create a `.env` file in the backend folder:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
JWT_SECRET=your_jwt_secret
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### 4. Database Setup
- Ensure PostgreSQL is running locally (default: user `postgres`, password `postgres`, db `postgres`).
- Run Prisma migrations:
```sh
npx prisma migrate dev --name init
```
- (Optional) Seed the database if a seed script is provided.

---

## Running the Backend

### **Locally (without Docker):**
```sh
npm run dev
```
- The server will start on `http://localhost:3000`.

### **With Docker (standalone):**
```sh
docker build -t sprint-backend .
docker run --rm -p 3000:3000 -e DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5432/postgres sprint-backend
```
- Make sure your local Postgres is accessible to Docker (use `host.docker.internal` on Mac/Windows).

### **With Docker Compose (recommended):**
From the project root:
```sh
docker-compose up --build
```
- This will start the backend, frontend, database, and Prisma Studio.

---

## Architecture Diagram

```mermaid
graph TD
  subgraph API Layer
    A[Express.js App]
    B[Auth Controller]
    C[User Controller]
    D[Task Controller]
    E[AI Controller]
    F[Analytics Controller]
  end
  subgraph Middleware
    M1[JWT Auth]
    M2[Rate Limiting]
    M3[Logger]
    M4[Error Handler]
  end
  subgraph Data Layer
    P[Prisma ORM]
    DB[(PostgreSQL)]
  end
  A -->|routes| B
  A -->|routes| C
  A -->|routes| D
  A -->|routes| E
  A -->|routes| F
  A --> M1
  A --> M2
  A --> M3
  A --> M4
  B --> P
  C --> P
  D --> P
  E --> P
  F --> P
  P --> DB
```

---

## API Documentation

- **Swagger UI:**
  - Available at `http://localhost:3000/api/docs` when the backend is running.
  - Lists all endpoints, request/response schemas, and error codes.

### **Key Endpoints**

#### **Auth**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

#### **Users**
- `GET /api/users` — List all users (admin only)
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user (admin only)
- `GET /api/users/stats/top-users` — Top users by time logged (admin only)
- `GET /api/users/stats/time-logged-per-day` — Time logged per user per day

#### **Tasks**
- `POST /api/tasks` — Create task
- `GET /api/tasks` — List tasks
- `GET /api/tasks/:id` — Get task by ID
- `PATCH /api/tasks/:id/progress` — Update task status/progress
- `DELETE /api/tasks/:id` — Delete task

#### **AI**
- `POST /api/ai/suggest` — Get AI-generated task description

---

## Testing
- Run unit tests:
```sh
npm test
```

---

## Logging & Observability
- All API calls and errors are logged using Winston.
- Logs include method, path, userId, and latency.

---

## Rate Limiting

- The API enforces a global rate limit of **100 requests per 15 minutes per IP address**.
- If the limit is exceeded, the API will respond with:
  - HTTP status: `429 Too Many Requests`
  - JSON body: `{ "message": "Too many requests, please try again later." }`
- This helps protect the service from abuse and accidental overload.

**Note:** The rate limit can be adjusted in `src/app.ts` via the `express-rate-limit` middleware.

---

## License
MIT 