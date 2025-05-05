# Psychology Learning Management System

A comprehensive Learning Management System (LMS) designed specifically for psychology courses and workshops. This platform provides features for course management, student enrollment, homework assignments, and interactive workshops.

## Project Structure

The project is divided into two main components:

### Backend

- Built with NestJS and TypeORM
- PostgreSQL database for data storage
- RESTful API for frontend communication
- Authentication with JWT
- Entity management for courses, modules, lessons, homework, users, etc.

### Frontend

- Built with Next.js (React) and TypeScript
- Ant Design component library for UI
- Context-based state management
- Responsive design for all devices
- Role-based access (admin, instructor, student)

## Features

- **User Management**: Student and instructor accounts, admin dashboard, user profiles
- **Course Management**: Create and manage courses, modules, and lessons
- **Content Delivery**: Structured lesson content with rich text support
- **Homework System**: Create, assign, submit, and grade homework assignments
- **Workshop Management**: Schedule and manage virtual workshops with Jitsi integration
- **Progress Tracking**: Monitor student progress through courses
- **Admin Dashboard**: Comprehensive administration tools

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

## Installation

### Backend Setup

```bash
cd lms_workshop/backend
npm install
cp .env.example .env
# Configure your database connection in .env
npm run start:dev
```

### Frontend Setup

```bash
cd lms_workshop/frontend
npm install
cp .env.example .env
# Configure your API connection in .env
npm run dev
```

## Database Migration

The project includes database export utilities for easy migration:

```bash
cd lms_workshop/backend
./scripts/export-db.sh     # SQL export
./scripts/export-db.sh -j  # JSON export
```

See `lms_workshop/backend/README-DB-EXPORT.md` for more details.

## Documentation

- API documentation is available at `/api/docs` when the backend is running
- Component documentation is available in README files throughout the project

## Contributors

- Pratik Khanapurkar

## License

This project is proprietary software. All rights reserved. 