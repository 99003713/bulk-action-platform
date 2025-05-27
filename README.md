# 📦 Bulk Action Platform Documentation

## Overview
A scalable and modular platform to handle bulk actions in CRM-like systems, supporting scheduling, status tracking, retries, and extensibility.

---

## 🧠 Approach

- **Modular Design**: All logic is split into `controllers`, `services`, `models`, `queues`, and `utils` for better maintainability and testing.
- **Scalable Queue System**: Uses **RabbitMQ** to handle bulk jobs asynchronously and scalably.
- **Robust Scheduling**: Jobs can be executed immediately or scheduled for a future time.
- **Per-User Status Tracking**: Each target user has a status (`pending`, `success`, `failed`, `skipped`) with optional error metadata.
- **Testable Code**: Core components are unit-tested using `jest`.

---

## 🧰 Tech Stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **RabbitMQ** for job queuing
- **Jest** for unit testing
- **dotenv** for environment config
- **Winston (or console.log)** for logging
- **Node Cron** for Scheduling

---

## 🏗️ Architecture Overview

- **Admin API Layer**: Accepts bulk action creation requests.
- **MongoDB**:
  - `bulkActions`: stores metadata of each bulk action.
  - `bulkActionTargets`: stores status of each user in the action.
- **RabbitMQ**: Queues bulk actions for async processing.
- **Workers**: Consume and execute queued jobs.
- **Cron Job**: Monitors future scheduled jobs.

---

## 📥 Bulk Action Creation

### Endpoint
`POST /bulk-actions`

### Payload
```json
{
  "entityType": "user",
  "actionType": "sendEmail",
  "targetUsers": ["user1", "user2"],
  "payload": { "subject": "Hello!" },
  "scheduledAt": "2025-05-27T10:00:00.000Z"
}
```

- If `scheduledAt` is past or not present → enqueues immediately.
- If `scheduledAt` is future → handled by scheduled cron.

### MongoDB Storage
Creates a document in `bulkActions`, and multiple documents in `bulkActionTargets`.

---

## 📄 MongoDB Schema Design

### 1. `bulkActions` Collection (Parent)
Stores meta info for each bulk operation.
```ts
{
  _id: ObjectId,
  entityType: string,
  actionType: string,
  payload: object,
  scheduledAt: Date,
  createdBy: string,
  totalUsers: number,
  stats: {
    success: number,
    failed: number,
    pending: number,
    skipped: number
  },
  createdAt: Date
}
```

### 2. `bulkActionTargets` Collection (Child)
Stores one document per user targeted.
```ts
{
  _id: ObjectId,
  bulkActionId: ObjectId, // Foreign key to bulkActions
  userId: string,
  status: 'pending' | 'success' | 'failed' | 'skipped',
  error: string | null,
  createdAt: Date
}
```

#### 🔗 Relationship:
- `bulkActionTargets.bulkActionId` → `bulkActions._id`
- Enables pagination, filtering, and scalable processing
- Indexes recommended:
  ```ts
  db.bulkActionTargets.createIndex({ bulkActionId: 1 })
  db.bulkActionTargets.createIndex({ bulkActionId: 1, status: 1 })
  ```

---

## ⚙️ How Bulk Processing Works

### 1. Queueing & Scheduling
- Immediate actions → pushed to RabbitMQ directly.
- Future actions → handled by a cron job every minute.

### 2. Worker Logic (bulkWorkerConsumer.js)
- Consumes from RabbitMQ queue
- Processes each user in `bulkActionTargets`
- Updates status:
  - `pending` → before processing
  - `success` → on success
  - `failed` → on error
  - `skipped` → logic-driven skip
- Implements retry with backoff

---

## 📊 Monitoring & Analytics

### `GET /bulk-actions?status=pending&page=2&limit=50`
Returns all bulk action with target details in pages`.

   - `status(Optional)` → 'pending', 'in-progress', 'completed', 'failed'
  - `page(Optional)` → page number
  - `limit(Optional)` → page size limit


### `GET /bulk-actions/:id/status`
Returns action status with target details from both the document.

### `GET /bulk-actions/:id/stats`
Returns stats of provided action with target details.


---

## 🔧 Extensibility
- Useful for actions like:
  - sendEmail
  - blockUser
  - adjustPoints

---

## ⚙️ How to Run Locally

**Install required packages**
- > npm install

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

---

## Notes:
Use a REST client like Postman or curl to test the APIs.

Make sure MongoDB and RabbitMQ are running locally as per setup instructions.

The bulk action queue will process actions asynchronously, so status and stats may update after some delay.

---