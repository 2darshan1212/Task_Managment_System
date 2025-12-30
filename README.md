# Task Management System

A simple task management application built with the MERN stack.

## Features

- User authentication (JWT)
- Role-based access (Admin/User)
- Admin can create, update, delete and assign tasks
- Users can view assigned tasks and update status
- Task priority levels (High, Medium, Low)
- Pagination support

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

**Frontend:** React, React Router, Axios, Context API

## Project Structure

```
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` file in backend folder:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_secret_key
```

Create `.env` file in frontend folder:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks (Admin)
- `GET /api/tasks/my-tasks` - Get assigned tasks (User)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin)
- `PUT /api/tasks/:id` - Update task (Admin)
- `DELETE /api/tasks/:id` - Delete task (Admin)
- `PATCH /api/tasks/:id/status` - Update task status (User)

## Demo Credentials

**Admin:**
- Email: admin@example.com
- Password: admin123

**User:**
- Email: user@example.com
- Password: user123

## License

MIT
