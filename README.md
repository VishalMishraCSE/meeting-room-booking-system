# 🏢 Meeting Room Booking System (MRBS)

A modern, BookMyShow-style web application for browsing, scheduling, and managing meeting room reservations. This system is designed for organization-wide use, featuring instant booking, timeline slot selections, visual floor plan cards, and automated notifications.

---

## 📂 Project Structure

This project is set up as a full-stack monorepo:

*   **`frontend/`**: The web user interface, built with **Next.js (React)**, **TypeScript**, and **Tailwind CSS**.
*   **`backend/`**: The REST API and WebSocket gateway, built with **Node.js (Express)**, **TypeScript**, and **Prisma ORM**.
*   **`Meeting_Room_Booking_System_HR_Specification.docx`**: System specification document detailing initial HR requirements.
*   **`meeting_room_analysis.md`**: Initial analysis of requirements, architecture, and tech stack details.

---

## 🚀 Getting Started

To get the application up and running locally, follow these steps:

### ⚙️ Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (version `v18` or higher recommended, current workspace using `v22.20.0`)
*   [npm](https://www.npmjs.com/) (installed automatically with Node.js)
*   A running database instance (PostgreSQL, MySQL, or SQLite)

---

### 💻 1. Setting up the Backend

1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables:
    *   Copy the template: `cp .env.example .env` (or duplicate the file manually).
    *   Open `.env` and set your `DATABASE_URL` connection string.
4.  Generate Prisma client and run database migrations:
    ```bash
    npm run prisma:generate
    npm run prisma:migrate
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The API server runs by default on `http://localhost:5000`.

---

### 🎨 2. Setting up the Frontend

1.  Navigate into the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: This automatically runs the `postinstall` script to generate the Prisma client.*
3.  Configure environment variables:
    *   Copy the template: `cp .env.example .env` (or duplicate the file manually).
    *   Open `.env` and configure your `DATABASE_URL` and `DIRECT_URL` (PostgreSQL).
4.  Initialize schema and seed simulated roles:
    ```bash
    npx prisma db push
    npx prisma db seed
    ```
5.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:3000`.

---

## 🤝 For Contributors

We follow a typical feature branch workflow:

1.  **Pull latest changes**: Always run `git pull origin main` before starting new work.
2.  **Create a feature branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Implement your changes**: Work in the respective `frontend/` or `backend/` directories.
4.  **Test your changes**: Ensure typescript compiles and tests pass.
5.  **Commit and push**:
    ```bash
    git add .
    git commit -m "feat: add user login component"
    git push origin feature/your-feature-name
    ```
6.  **Create a Pull Request** on GitHub for code review.

---

## 🛡️ License
This project is proprietary and intended for internal use.
