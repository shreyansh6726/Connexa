# Connexa

Connexa is a full-stack job marketplace that connects candidates with employers. Candidates can build profiles, search and apply for jobs, and receive skill-match feedback. Employers can publish jobs, discover candidates, and manage applications. Administrators can review platform activity.

The application uses a React/Vite frontend, an Express/Node.js API, and MongoDB for persistent storage.

## Features

- Candidate, employer, and administrator accounts
- JWT-based authentication and role-based access control
- Candidate profiles with skills, experience, resumes, and contact details
- Job creation, editing, search, filtering, and status management
- Job applications with duplicate-application protection
- Built-in candidate/job skill matching
- AI-assisted bio generation and job-description enhancement
- Employer applicant management and application status updates
- In-app notifications
- Administrator dashboard with platform statistics and user listing
- Optional first-run demo data seeding

## Technology

- React 19 and TypeScript
- Vite and Tailwind CSS
- Express 4
- MongoDB Node.js driver
- JWT and bcryptjs authentication
- Lucide React icons and Motion animations

## Requirements

- Node.js 18 or newer
- npm
- MongoDB 6+ or a MongoDB Atlas cluster

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Then set `MONGODB_URI` in `.env` to your MongoDB connection string. For MongoDB Atlas, this is available under **Database > Connect > Drivers**.

Example:

```env
MONGODB_URI="mongodb+srv://username:password@cluster.example.mongodb.net/"
MONGODB_DB_NAME="connexa"
MONGODB_SEED="true"
JWT_SECRET="replace-this-with-a-long-random-secret"
APP_URL="http://localhost:3000"
```

Do not commit `.env` or any file containing real credentials.

### 3. Start the development server

```bash
npm run dev
```

The application is available at [http://localhost:3000](http://localhost:3000).

The server connects to MongoDB before accepting requests. If `MONGODB_URI` is missing or still contains the placeholder value, startup will fail with a configuration error.

## Demo data

When `MONGODB_SEED=true`, the server inserts the built-in demo records into empty MongoDB collections. Seeding does not overwrite existing records.

The seeded demo accounts use the password `password123`:

| Role | Email |
| --- | --- |
| Administrator | `admin@connexa.com` |
| Employer | `employer1@techcorp.com` |
| Employer | `employer2@innovate.io` |
| Candidate | `john.doe@email.com` |
| Candidate | `jane.smith@email.com` |
| Candidate | `alex.dev@email.com` |

Change or remove these accounts before using the application in production.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express server with Vite development middleware |
| `npm run lint` | Run the TypeScript compiler without emitting files |
| `npm run build` | Build the frontend and bundle the production server |
| `npm start` | Start the bundled production server from `dist/` |
| `npm run preview` | Preview the Vite frontend build |
| `npm run clean` | Remove generated build output |

For a production run:

```bash
npm run build
npm start
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB_NAME` | No | Database name; defaults to `connexa` |
| `MONGODB_SEED` | No | Set to `true` to seed empty collections with demo data |
| `JWT_SECRET` | Recommended | Secret used to sign authentication tokens |
| `APP_URL` | No | Public application URL used by deployments and integrations |
| `OPENAI_API_KEY` | No | Reserved optional configuration; current matching and generation logic uses built-in algorithms |

## MongoDB collections

The backend stores application data in these collections:

- `users` — candidate, employer, and administrator profiles
- `passwords` — bcrypt password hashes keyed by user email
- `jobs` — job postings
- `applications` — candidate applications and match results
- `notifications` — user and administrator notifications

The `.data` directory is no longer read or written by the application.

## API overview

All API routes are served under `/api`.

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile` |
| Jobs | `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PUT /api/jobs/:id`, `GET /api/jobs/candidates` |
| Applications | `POST /api/applications/apply`, `GET /api/applications/employer`, `GET /api/applications/employee`, `PUT /api/applications/:id/status` |
| AI helpers | `POST /api/ai/match`, `POST /api/ai/generate-bio`, `POST /api/ai/enhance-job` |
| Notifications | `GET /api/notifications`, `PUT /api/notifications/read-all`, `PUT /api/notifications/:id/read` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users` |

Protected endpoints require a bearer token:

```http
Authorization: Bearer <jwt-token>
```

## Project structure

```text
.
├── server.ts                 # Express/Vite server entry point
├── src/
│   ├── components/           # Shared React components
│   ├── context/              # React context providers
│   ├── pages/                # Role-specific application pages
│   ├── server/
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── middleware/       # Authentication and authorization
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Matching and content-generation services
│   │   └── db.ts              # MongoDB connection and data access layer
│   ├── services/api.ts        # Frontend API client
│   └── types.ts               # Shared TypeScript types
├── .env.example               # Environment variable template
└── package.json
```

## Troubleshooting

### MongoDB connection errors

Check that:

1. `MONGODB_URI` is present in `.env`.
2. Your MongoDB user has access to the configured database.
3. Your IP address is allowed in MongoDB Atlas Network Access.
4. Special characters in the username or password are URL-encoded.

### Port already in use

The development and production server listen on port `3000`. Stop the process using that port before starting Connexa again.

### Demo data is not appearing

Confirm that `MONGODB_SEED="true"` is set and that the configured collections are empty. Existing collections are intentionally not overwritten.

## License

This project is currently private and does not declare a distribution license.
