# 💰 Personal Savings Goal Tracker - Backend

This is the **backend API** for the Personal Savings Goal Tracker web app. Built with **Node.js, Express, and MongoDB**, it handles user authentication and savings goal management.

---

## 📝 What is this?

The backend provides RESTful API endpoints for managing users and their savings goals. It securely stores user data and goals, allowing clients to create accounts, log in, and track progress toward financial targets.

---

## ❓ Why does it exist?

Many people struggle to organize and monitor their savings goals. This backend enables a web app that helps users set, update, and achieve personal savings targets, promoting better financial habits.

---

## 📂 Folder Structure

    backend/
    ├── controllers/       # Request handlers
    ├── models/            # Mongoose schemas
    ├── routes/            # API route definitions
    ├── middleware/        # Auth & validation middleware
    ├── server.js          # Application entry point
    ├── .env.example       # Example environment variables
    └── package.json

---

## 📄 API Documentation
    You can import the Postman collection from Personal-Savings-Goal-Tracker\backend\Personal-Savings-Goal-Tracker.postman_collection.json
    or check the Swagger documentation (if hosted).

---

## 🚀 How to Use, Run, or Deploy

1. **Clone the repository:**
   ```
   git clone https://github.com/Gowthams012/Personal-Savings-Goal-Tracker.git
   cd Personal-Savings-Goal-Tracker/backend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   - Copy `backend/.env.example` to `backend/config/.env` and fill in values.
   - Keep secrets out of Git (already covered by `.gitignore`).
   - Example keys:
     - `MONGO_URI=your_mongodb_connection_string`
     - `JWT_SECRET=your_jwt_secret`
     - `PORT=5000`
     - `NODE_ENV=development`

4. **Run the server:**
   ```
   npm run dev
   ```
   The API will be available at `http://localhost:5000` (default).

5. **Deploy:**
   - Deploy to platforms like Heroku, Vercel, or your own server.
   - Ensure environment variables are set in your deployment environment.

---

## 📦 Tech Stack

- **Node.js** & **Express** – Backend framework
- **MongoDB** & **Mongoose** – Database
- **JWT** – User authentication
- **BcryptJS** – Password hashing
- **CORS** – Cross-origin support
- **Dotenv** – Environment configuration
- **Compression** – GZIP compression *(optional)*
- **Cookie-Parser** – Cookie handling *(optional)*

