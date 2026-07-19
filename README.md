# CampusFlow — Student Life Operating System

A full-stack web app that centralizes a student's academic life — tasks, placements, hackathons, notes, and progress tracking — in one dashboard.

## Tech Stack
**Backend:** Node.js, Express, PostgreSQL, Redis, JWT Auth, bcrypt, Swagger/OpenAPI, node-cron, Docker & Docker Compose
**Frontend:** React (Vite), React Router, Tailwind CSS, shadcn/ui

## Features
- JWT-based authentication (signup/login)
- Task management (CRUD)
- Placement/internship tracker with status pipeline
- Hackathon tracking
- Notes with PDF upload, organized by subject
- Progress tracking (DSA solved, subjects completed, internship applications)
- Auto-tracked login streak
- Leaderboard with weighted scoring and Redis caching (60s TTL)
- Auto-generated deadline notifications (hourly cron job)
- Auto-logged user activity history
- Full API documentation via Swagger UI (`/api-docs`)
- Fully containerized (Postgres + Redis + Server) via Docker Compose

## Architecture Highlights
- RESTful API design with protected routes (JWT middleware)
- Parameterized SQL queries (SQL injection safe)
- Redis caching for expensive leaderboard queries
- Foreign key relationships across 10+ tables
- Window functions (RANK()) for leaderboard ranking
