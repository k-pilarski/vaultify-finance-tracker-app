# Vaultify - Personal Finance Tracker

Vaultify is a full-stack, monorepo-based web application designed to help users track their personal finances, manage transactions, and set financial goals. 

## 🚀 Tech Stack

**Frontend (Client):**
* React 18
* Vite
* TypeScript
* Tailwind CSS & PostCSS
* TanStack Query (React Query)
* Zustand (State Management)
* Lucide React (Icons)

**Backend (Server):**
* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* Zod (Schema Validation)

## 📁 Project Structure

This project uses npm workspaces to manage a monorepo setup:
* `/client` - React frontend application
* `/server` - Express backend application

## 🛠️ Getting Started

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd vaultify-finance-tracker-app
   ```

2. Install dependencies for all workspaces from the root directory:
   ```bash
   npm install
   ```

### Environment Setup

1. Navigate to the `server` directory and create a `.env` file based on `.env.example`:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Update the `DATABASE_URL` in the `/server/.env` file with your local PostgreSQL credentials.

### Database Initialization

Push the Prisma schema to your PostgreSQL database:
```bash
npm run db:push --workspace=server
```

*(Optional)* Open Prisma Studio to view your database:
```bash
npm run db:studio --workspace=server
```

## 🏃‍♂️ Running the Application

You can start both the client and server development environments using npm workspaces from the root directory.

**Start the Backend Server:**
```bash
npm run dev --workspace=server
```
*The server will run on http://localhost:5000 (or your configured port).*

**Start the Frontend Client:**
```bash
npm run dev --workspace=client
```
*The React app will be available at http://localhost:5173.*