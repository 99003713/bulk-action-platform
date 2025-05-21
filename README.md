# 📦 Bulk Action Platform

This project is a scalable **Bulk Action Platform** designed for CRM systems, where admins can perform bulk operations across large user bases. It supports scheduling, queuing, and detailed per-user status tracking.

------------------------------------------------------------------------

## 🧠 Approach

- **Modular Design**: All logic is split into `controllers`, `services`, `models`, `queues`, and `utils` for better maintainability and testing.
- **Scalable Queue System**: Uses **RabbitMQ** to handle bulk jobs asynchronously and scalably.
- **Robust Scheduling**: Jobs can be executed immediately or scheduled for a future time.
- **Per-User Status Tracking**: Each target user has a status (`pending`, `success`, `failed`, `skipped`) with optional error metadata.
- **Testable Code**: Core components are unit-tested using `jest`.

------------------------------------------------------------------------

## 🧰 Tech Stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **RabbitMQ** for job queuing
- **Jest** for unit testing
- **dotenv** for environment config
- **Winston (or console.log)** for logging
- **Node Cron** for Scheduling

------------------------------------------------------------------------


## ⚙️ How Bulk Processing Works

### 📝 Bulk Action Creation

- A `POST /api/bulk-actions` API is available to create a new bulk action.
- Users can **immediately execute** or **schedule** actions using the `scheduledAt` field.
- Payload includes:
  - `entityType` (e.g., user, account)
  - `actionType` (e.g., sendEmail, deactivateUser)
  - `targetUsers[]` (array of user IDs)
  - `payload` (custom action-specific data)

---

### 🕒 Queueing

- If `scheduledAt` is **now or in the past**, the job is immediately published to **RabbitMQ**.
- If `scheduledAt` is in the **future**, a **cron job** regularly checks and enqueues jobs whose time has arrived.

---

### 🧵 Processing Worker

- A background worker (`workers/bulkWorkerConsumer.js`) listens to the RabbitMQ queue.
- It processes each user **sequentially** (or could be extended for parallelism).
- For each user:
  - Executes the action logic.
  - Updates the **status** (`pending`, `success`, `failed`, or `skipped`) in MongoDB.
  - Optionally logs any error metadata with timestamps.

---

### 📊 Stats & Monitoring

- **Status API** (`GET /api/bulk-actions/:actionId/status`) provides real-time status of each target user.
- **Stats API** (`GET /api/bulk-actions/:actionId/stats`) returns aggregated results:
  - Total users
  - Count of users per status (success, failed, pending, skipped)

---

This design ensures that even large user actions are:
- Decoupled and asynchronous
- Fault-tolerant with per-user tracking
- Scalable via RabbitMQ and worker pool

------------------------------------------------------------------------

## 📁 Project Structure
.
├── README.md
├── __tests__
│   ├── controllers
│   │   ├── createBulkAction.controller.test.js
│   │   ├── getBulkActionStats.controller.test.js
│   │   ├── getBulkActionStatus.controller.test.js
│   │   └── listBulkActions.controller.test.js
│   └── services
│       ├── bulkActionQueue.service.test.js
│       ├── createBulkAction.service.test.js
│       ├── getActionById.service.test.js
│       ├── getActionStats.service.test.js
│       └── getAllBulkActions.service.test.js
├── controllers
│   ├── createBulkAction.controller.js
│   ├── getBulkActionStats.controller.js
│   ├── getBulkActionStatus.controller.js
│   └── listBulkActions.controller.js
├── cron
│   ├── bulkActionCron.js
│   └── dataCleanup.js
├── index.js
├── middlewares
│   └── errorHandler.js
├── models
│   └── bulkAction.model.js
├── routes
│   ├── bulkActions.route.js
│   └── index.js
├── services
│   ├── bulkActionQueue.service.js
│   ├── createBulkAction.service.js
│   ├── getActionById.service.js
│   ├── getActionStats.service.js
│   └── getAllBulkActions.service.js
├── utils
│   ├── logger.js
│   └── rabbitmq.js
├── validators
│   ├── createBulkAction.validator.js
│   └── getBulkActionById.validator.js
└── workers
    └── bulkWorkerConsumer.js


------------------------------------------------------------------------

## ⚙️ How to Run Locally

**Install required packages**
npm install

**Install MongoDB community edition** 
- > brew install mongodb-community@6.0

**Start MongoDB service**
- > brew services start mongodb-community@6.0

**To stop MongoDB service (if needed)**
- > brew services stop mongodb-community@6.0

**Install RabbitMQ**
- >brew install rabbitmq

**Start RabbitMQ server**
- > brew services start rabbitmq

**To stop RabbitMQ server (if needed)**
- > brew services stop rabbitmq

------------------------------------------------------------------------

## API Endpoints (Provided Postman Collection)
Local URL: http://localhost:3000
**Start the Server**
- > npm run start

**1. Create Bulk Action**
URL: POST /api/bulk-actions

Description: Creates a new bulk action and enqueues it if scheduled time is now or in the past.

Request Body Example:
{
  "entityType": "user",
  "actionType": "sendEmail",
  "accountId": "123456",
  "payload": { "subject": "Hello", "message": "Welcome!" },
  "targetUsers": ["user1", "user2", "user3"],
  "scheduledAt": "2025-05-20T18:00:00.000Z"  // Optional
}
Success Response:

Status: 201

Body: Created bulk action object with status and targetUsers


--

**2. Get Bulk Action Status by ID**
URL: GET /api/bulk-actions/:actionId/status

Description: Fetches the current status and details of a bulk action by its ID.

Response Example:

{
  "_id": "60a6f3c0e1f1234567890abc",
  "entityType": "user",
  "status": "in-progress",
  "targetUsers": [
    { "userId": "user1", "status": "pending", "error": "" },
    { "userId": "user2", "status": "success", "error": "" }
  ]
}

--

**3. Get Bulk Action Stats by ID**
URL: GET /api/bulk-actions/:actionId/stats

Description: Retrieves aggregated stats about the bulk action progress.

Response Example:

{
  "actionId": "60a6f3c0e1f1234567890abc",
  "totalUsers": 3,
  "successCount": 1,
  "failedCount": 0,
  "skippedCount": 0,
  "pendingCount": 2
}


--

**4. List All Bulk Actions**
URL: GET /api/bulk-actions

Description: Returns a list of all bulk actions sorted by creation date (newest first).

Response Example:
[
  {
    "_id": "60a6f3c0e1f1234567890abc",
    "entityType": "user",
    "status": "completed",
    "createdAt": "2025-05-20T18:00:00.000Z"
  },
  {
    "_id": "60a6f3c0e1f1234567890def",
    "entityType": "account",
    "status": "pending",
    "createdAt": "2025-05-19T15:00:00.000Z"
  }
]


----------------------------------------------------------------


## Notes:
Use a REST client like Postman or curl to test the APIs.

Make sure MongoDB and RabbitMQ are running locally as per setup instructions.

The bulk action queue will process actions asynchronously, so status and stats may update after some delay.
