# Task Management API

![NestJS](https://img.shields.io/badge/NestJS-1ED760?logo=nestjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=white)
![Bull](https://img.shields.io/badge/Bull-FFCE54?logo=redis&logoColor=white)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The Task Management API is a powerful backend application built with NestJS to help users efficiently manage tasks. It includes features like user authentication, task management, reminders, and real-time notifications via WebSockets.

## Features

- **User Authentication**

  - Register and login using JWT authentication.
  - Secure endpoints with guards for authorized access.

- **Task Management**

  - CRUD operations for tasks.
  - Assign tasks to users.
  - Filter tasks by status (active/completed).

- **Reminders**

  - Enable task reminders.
  - Schedule reminders via Bull queues and cron jobs.
  - Get real-time alerts via WebSockets.

- **Real-Time Notifications**

  - Implemented with Socket.IO for instant updates.

- **API Documentation**
  - Available via Swagger UI.

## Technology Stack

- **Backend Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL (Managed via MikroORM)
- **Queue Management**: Bull (with Redis)
- **Real-Time Communication**: Socket.IO
- **API Documentation**: Swagger
- **Mail Service**: MailHog (Local mail server)

## Getting Started

### Prerequisites

- **Node.js**: v14 or higher
- **Yarn**: v1.22.22
- **MySQL**: v5.7 or higher
- **Redis**: v5 or higher

### Installation

1. Clone the Repository:

   ```sh
   git clone https://github.com/Nifemi2004/task-management-api.git
   cd task-management-api
   ```

2. Install Dependencies:

   ```sh
   yarn install
   ```

### Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PORT=3000
```

### Running the Application

1. **Run Migrations**:

   ```sh
   npx mikro-orm-ocm migration:up
   ```

2. **Start the Application**:
   ```sh
   yarn start
   ```

The server should now be running at `http://localhost:3000`.

## API Documentation

Access Swagger UI at:

```
http://localhost:3000/docs
```

## Usage

### 1. Authentication

#### a. Register a New User

- **Endpoint**: `POST /users`
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "email": "john@example.com",
      "token": "jwt_token_here",
      "username": "john_doe"
    }
  }
  ```

#### b. Login

- **Endpoint**: `POST /users/login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "email": "john@example.com",
      "token": "jwt_token_here",
      "username": "john_doe"
    }
  }
  ```

### 2. Task Management

All task endpoints require authentication. Include the JWT token in the `Authorization` header as `Bearer <token>`.

#### a. Create a Task

- **Endpoint**: `POST /tasks`
- **Request Body**:
  ```json
  {
    "description": "Clean the plates.",
    "status": "active",
    "dueDate": "2024-10-03T14:22:10.000Z",
    "reminderEnabled": true,
    "reminderTimeGapMinutes": 30
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "description": "Clean the plates.",
    "status": "active",
    "dueDate": "2024-10-03T14:22:10.000Z",
    "createdAt": "2024-10-03T19:22:06.407Z",
    "updatedAt": "2024-10-03T19:22:06.407Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "reminderEnabled": true,
    "reminderTimeGapMinutes": 30
  }
  ```

### 3. Real-Time Reminders

To receive real-time reminders:

- **Connect to WebSocket Gateway**:

  ```js
  import io from 'socket.io-client';

  const token = 'YOUR_JWT_TOKEN';
  const socket = io('http://localhost:3000', {
    query: { token },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server.');
  });

  socket.on('task-reminder', (data) => {
    alert(data.message);
    console.log('Received Task Reminder:', data.task);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server.');
  });
  ```

- **Trigger Reminders**:
  When a task reminder is due, the server emits a `task-reminder` event to connected users.

---

### 🚀
