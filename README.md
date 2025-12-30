# Task Management System

A full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication with JWT
- Role-based access control (Admin/User)
- Admin can create, update, delete and assign tasks
- Users can view assigned tasks and update status
- Task priority levels (High, Medium, Low)
- Task status management (Pending, Completed)
- Pagination support
- Responsive design

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React 19
- React Router v7
- Axios for API calls
- Vite for build tooling
- Context API for state management

## Project Structure

```
TaskManagement/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Tasks.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd TaskManagement
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_secret_key_here
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Seed Admin User (Optional)

```bash
cd backend
node seed.js
```

This creates an admin user with:
- Email: admin@example.com
- Password: admin123

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get all tasks (paginated) | Admin |
| GET | `/api/tasks/my-tasks` | Get assigned tasks | User |
| GET | `/api/tasks/:id` | Get task by ID | Auth |
| POST | `/api/tasks` | Create new task | Admin |
| PUT | `/api/tasks/:id` | Update task | Admin |
| DELETE | `/api/tasks/:id` | Delete task | Admin |
| PATCH | `/api/tasks/:id/status` | Update task status | Auth |

## Demo Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**User Account:**
- Register a new account via the registration page
- Default role is "user"

## Usage

### As Admin:
1. Login with admin credentials
2. View all tasks in the dashboard
3. Create new tasks and assign to users
4. Edit or delete existing tasks
5. Click on status to toggle between pending/completed

### As User:
1. Register or login with user credentials
2. View tasks assigned to you
3. Mark tasks as completed or pending

## Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
