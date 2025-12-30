# Task Management System

A full-stack task management application built with the MERN stack.

**Live Demo:** [https://task-managment-system-seven.vercel.app](https://task-managment-system-seven.vercel.app)

## Features

- User authentication with JWT
- Role-based access (Admin/User)
- Real-time updates with Socket.IO
- Admin can create, edit, delete and assign tasks
- Users can view their tasks and update status
- Task priority levels (High, Medium, Low)
- Pagination
- Fully responsive design

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Socket.IO, JWT

**Frontend:** React 19, React Router v7, Axios, Socket.IO Client, Vite

## Quick Start

### Backend

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

Start server:
```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Demo Accounts

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

Run `node seed.js` in backend folder to create admin account.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Tasks
- `GET /api/tasks` - Get all tasks (Admin)
- `GET /api/tasks/my-tasks` - Get my tasks (User)
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks` - Create task (Admin)
- `PUT /api/tasks/:id` - Update task (Admin)
- `DELETE /api/tasks/:id` - Delete task (Admin)
- `PATCH /api/tasks/:id/status` - Update status

### Users
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/profile` - Update profile

## Deployment

### Backend on Render

1. Create Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`

### Frontend on Vercel

1. Import project on [vercel.com](https://vercel.com)
2. Set root directory: `frontend`
3. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-url.onrender.com`

## Project Structure

```
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── server.js

frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── api.js
│   └── App.jsx
└── vite.config.js
```

## License

MIT
