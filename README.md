# DestinPQ Learning Management System

A full-stack Learning Management System built with Next.js frontend and NestJS backend.

## Live Demo

- **Frontend**: [https://destinpq-lms-frontend-6860e9083f5a.herokuapp.com/](https://destinpq-lms-frontend-6860e9083f5a.herokuapp.com/)
- **Backend API**: [https://destinpq-lms-63d26b382b63.herokuapp.com/](https://destinpq-lms-63d26b382b63.herokuapp.com/)

## Project Structure

This project is organized as a monorepo with two main directories:

- `frontend/`: Next.js application serving the user interface
- `backend/`: NestJS API handling data and business logic

## Technology Stack

### Frontend
- **Framework**: Next.js 15
- **UI Library**: React 18
- **UI Components**: Ant Design
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger (available at /api)

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Local Development

1. Clone the repository:
```
git clone https://github.com/yourusername/destinpq-lms.git
cd destinpq-lms
```

2. Set up the backend:
```
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run start:dev
```

3. Set up the frontend:
```
cd ../frontend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

4. Access the application:
   - Frontend: http://localhost:22000
   - Backend API: http://localhost:3001/lms

## Deployment

Both frontend and backend are deployed on Heroku:

### Backend
```
cd backend
git push heroku main
```

### Frontend
```
cd frontend
git push heroku main
```

## License

MIT

## Contributors

- Pratik Khanapurkar 