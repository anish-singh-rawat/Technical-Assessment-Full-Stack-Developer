# Task Management System

A full-stack task management application built with Node.js and React. Multiple users can create and manage tasks in real time. Admins can view and filter tasks across all customers.

---

## Tech Stack

**Backend** — Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT

**Frontend** — React, Vite, Axios, Socket.IO client, React Hot Toast

---

## Project Structure

```
── backend-repo/
── frontend-repo/
```

---

## Setup and Installation

### Prerequisites

- Node.js v18 or higher

### Backend

```bash
cd backend-repo
npm install
```

Create a `.env` file in `backend-repo/`:

```
PORT=8080
NODE_ENV=development
MONGODB_URL=
JWT_SECRET=secret
JWT_REFRESH_SECRET=secret
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:8080`

### Frontend

```bash
cd frontend-repo
npm install
```

Create a `.env` file in `frontend-repo/`:

```
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## How to Use

1. Open the app and register an account. Choose role: `customer` or `admin`.
2. Log in with your credentials.
3. On the dashboard, create tasks using the `+ New Task` button.
4. Tasks are organized in three columns: Todo, In Progress, Done.
5. Use the move buttons on each card to change task status.
6. Use the filter bar to search, filter by status or priority, and sort tasks.
7. Changes made by any user appear in real time for all connected users who have access.


## Roles

**Customer**
- Can create, edit, delete, and move their own tasks
- Can only see their own tasks

**Admin**
- Can see all customers' tasks
- Can filter tasks by a specific customer using the customer dropdown
- Has access to all task operations


## Backend Features

- JWT authentication with access token (15 min) and refresh token (7 days)
- Auto token refresh — expired access tokens are silently renewed using the refresh token
- Role-based access control (admin / customer)
- CRUD APIs for tasks with title, description, status, priority, and timestamps
- Filtering by status and priority
- Sorting by created date (newest/oldest) or priority
- Pagination (10 tasks per page)
- Real-time task events via Socket.IO — create, update, move, delete
- Socket authentication middleware — only verified users can connect
- Targeted socket broadcasts — events are sent only to the task owner and admins
- In-memory caching with TTL to reduce database load
- Rate limiting on auth and task routes
- Conflict detection on concurrent task updates



## Frontend Features

- Login and Register pages with role selection
- Sidebar layout with orange accent theme
- Kanban-style board with three status columns
- Task cards showing title, description, priority badge, status badge, creator name, and timestamps
- Filters for status, priority, sort order, and text search
- Admin customer dropdown to filter tasks by a specific user
- Pagination controls
- Real-time updates via Socket.IO — no page refresh needed
- Optimistic UI updates for edit, move, and delete
- Conflict handling with toast notifications
- Fully responsive layout

