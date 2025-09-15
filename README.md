# Store Rating System

A full-stack web application that allows users to find and rate stores. It features distinct roles for normal users, store owners, and system administrators, providing a comprehensive platform for managing and viewing store ratings.

This project is built with a Node.js/Express backend, a React frontend, and a MySQL database.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)

## Features

- **Role-Based Access Control:**
  - **System Administrator:** Full control over users and stores. Can view system-wide metrics.
  - **Store Owner:** Can view a dashboard with analytics for their own stores, including average ratings and user feedback.
  - **Normal User:** Can browse, search, and rate stores. Can only rate a store once but can update their rating.

- **Store Management:**
  - Admins can create, read, update, and delete any store.
  - Admins can assign stores to Store Owners.

- **User Management:**
  - Admins can create, read, update, and delete any user.
  - Users can register and log in.

- **Rating System:**
  - Users can submit ratings from 1 to 5 for stores.
  - Average ratings are calculated for each store and for each store owner's portfolio.
  - Stores with no ratings display a rating of 0.

- **Dynamic UI:**
  - Search and filter functionality for stores and users.
  - Sortable lists for stores and users.

## Tech Stack

- **Backend:**
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [MySQL2](https://github.com/sidorares/node-mysql2) for database connection.
  - [JSON Web Tokens (JWT)](https://jwt.io/) for authentication.
  - [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) for password hashing.

- **Frontend:**
  - [React](https://reactjs.org/)
  - [Axios](https://axios-http.com/) for API requests.

- **Database:**
  - [MySQL](https://www.mysql.com/)

## Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/en/download/) (v16.x or later recommended)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## Installation & Setup


1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ayushpatil3100/store-rating-platform.git
    cd store-rating-platform
    ```

### Database Setup

1.  **Log in to your MySQL server:**
    ```bash
    mysql -u root -p
    ```

2.  **Create the database:**
    ```sql
    CREATE DATABASE platformDB;
    ```

3.  **Create the tables.** Use the following SQL schema to create the necessary tables in the `platformDB` database.

    ```sql
    USE platformDB;

    CREATE TABLE `users` (
      `id` int NOT NULL AUTO_INCREMENT,
      `name` varchar(60) NOT NULL,
      `email` varchar(255) NOT NULL,
      `password` varchar(255) NOT NULL,
      `address` varchar(400) DEFAULT NULL,
      `role` enum('System Administrator','Normal User','Store Owner') NOT NULL DEFAULT 'Normal User',
      PRIMARY KEY (`id`),
      UNIQUE KEY `email` (`email`)
    );

    CREATE TABLE `stores` (
      `id` int NOT NULL AUTO_INCREMENT,
      `name` varchar(60) NOT NULL,
      `address` varchar(400) NOT NULL,
      `owner_id` int DEFAULT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `name` (`name`),
      KEY `owner_id` (`owner_id`),
      CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    );

    CREATE TABLE `ratings` (
      `id` int NOT NULL AUTO_INCREMENT,
      `user_id` int NOT NULL,
      `store_id` int NOT NULL,
      `rating` int NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `user_store_unique` (`user_id`,`store_id`),
      KEY `store_id` (`store_id`),
      CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
      CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
      CONSTRAINT `rating_check` CHECK ((`rating` >= 1) AND (`rating` <= 5))
    );
    ```

4.  **(Optional) Seed the database with a default admin user:**
    ```sql
    INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
    ('Default Admin User', 'admin@example.com', 'YOUR_BCRYPT_HASH_HERE', 'System Administrator');
    ```
    > **Note on Password Hashing:** You need to generate a bcrypt hash for a password of your choice. You can use a simple Node.js script for this. In the `backend` directory, create a file `hash.js` with the following content:
    > ```javascript
    > const bcrypt = require('bcryptjs');
    > const password = 'Admin@123';
    > const salt = bcrypt.genSaltSync(10);
    > const hash = bcrypt.hashSync(password, salt);
    > console.log(hash);
    > ```
    > Run `npm install bcryptjs` and then `node hash.js`. Copy the output hash into the SQL statement.

### Backend Setup

1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install express mysql2 bcryptjs jsonwebtoken dotenv cors body-parser`
3.  Create and configure the environment file by copying the contents from the `.env` file provided in the context and updating the values with your local configuration.

### Frontend Setup

1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install`

## Environment Variables

The backend requires a `.env` file in the `backend/` directory with the following variables:

```properties
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=platformDB

# JWT Configuration
JWT_SECRET=a_very_strong_and_secret_key_for_jwt
```

## Running the Application

You need to run the backend and frontend servers in separate terminal windows.

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm start
    ```
    The server will start on `http://localhost:3000` (or the port specified in your `.env`).

2.  **Start the Frontend Development Server:**
    ```bash
    cd frontend
    npm start
    ```
    The React application will open in your browser, typically at `http://localhost:3001`.


## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint                               | Role(s) Required       | Description                                                              |
|--------|----------------------------------------|------------------------|--------------------------------------------------------------------------|
| `POST` | `/auth/register`                       | Public                 | Register a new user.                                                     |
| `POST` | `/auth/login`                          | Public                 | Log in and receive a JWT.                                                |
| `GET`  | `/stores`                              | Public                 | Get a list of all stores with search and sort options.                   |
| `POST` | `/stores/:storeId/rate`                | Normal User            | Submit or update a rating for a specific store.                          |
| `GET`  | `/store-owner/dashboard`               | Store Owner            | Get dashboard data, including owned stores and overall average rating.   |
| `GET`  | `/admin/dashboard`                     | System Administrator   | Get system-wide metrics (total users, stores, ratings).                  |
| `GET`  | `/admin/users`                         | System Administrator   | Get a list of all users with filtering and sorting.                      |
| `POST` | `/admin/users`                         | System Administrator   | Create a new user.                                                       |
| `PUT`  | `/admin/users/:id`                     | System Administrator   | Update an existing user's details.                                       |
| `DELETE`| `/admin/users/:id`                    | System Administrator   | Delete a user.                                                           |
| `GET`  | `/admin/stores`                        | System Administrator   | Get a list of all stores with filtering and sorting.                     |
| `POST` | `/admin/stores`                        | System Administrator   | Create a new store.                                                      |
| `PUT`  | `/admin/stores/:id`                    | System Administrator   | Update a store's details, including assigning an owner.                  |
| `DELETE`| `/admin/stores/:id`                   | System Administrator   | Delete a store.                                                          |

