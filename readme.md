# Results Service

A comprehensive test execution management microservice for QA and testing platforms. This service manages test runs, individual tests, and their execution results, providing a complete solution for tracking test execution cycles, outcomes, and metrics.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Development](#development)
- [Docker Deployment](#docker-deployment)

## ✨ Features

- **Test Run Management**: Create and manage test execution cycles
- **Test Instance Tracking**: Track individual test instances within runs
- **Result Recording**: Capture detailed execution results with logs and timing
- **Authentication**: Secure endpoints with JWT bearer token authentication
- **Flexible Search**: Generic search capabilities across all resources
- **Auto-calculated Duration**: Automatic timing calculations based on start/end times
- **RESTful API**: Standard REST conventions for easy integration

## 🛠 Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi schema validation
- **Authentication**: JWT (via prime-qa-commons)
- **Development**: ts-node-dev with hot reload

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd results-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   If you encounter dependency conflicts:
   ```bash
   npm install --force
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=8084
   JWT_SECRET=your_secret_key_here
   MONGO_URI=mongodb://localhost:27017/results_service
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The service will start on `http://localhost:8084` (or your configured PORT)

5. **Verify service is running**
   ```bash
   curl http://localhost:8084/health
   ```
   
   Expected response: `{"status":"ok"}`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `8084` | No |
| `JWT_SECRET` | Secret key for JWT verification | `super_secret_key` | Yes (production) |
| `MONGO_URI` | MongoDB connection string | See config | Yes |
| `NODE_ENV` | Environment mode | `development` | No |

### MongoDB Connection

The service connects to MongoDB on startup. Ensure your MongoDB instance is accessible and the connection string is correctly configured in the `.env` file or environment variables.

## 📚 API Documentation

All endpoints (except `/health`) require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Base URL

```
http://localhost:8084
```

---

## Health Check

### GET /health

Check service availability.

**Authentication**: Not required

**Response**: `200 OK`
```json
{
  "status": "ok"
}
```

---

## Runs API

Test runs represent execution cycles within a project. Each run contains multiple tests and tracks when they were executed, by whom, and in what environment.

### POST /runs

Create a new test run.

**Request Body**:
```json
{
  "projectId": "string (ObjectId, required)",
  "name": "string (min 2 chars, required)",
  "description": "string (optional)",
  "type": "string (enum, optional)",
  "status": "string (enum, optional)",
  "environment": "string (optional)",
  "executedBy": "string (ObjectId, optional)",
  "startTime": "date (ISO 8601, optional)",
  "endTime": "date (ISO 8601, optional)"
}
```

**Field Details**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | String (ObjectId) | ✅ | MongoDB ObjectId of the project |
| `name` | String | ✅ | Name of the test run (min 2 characters) |
| `description` | String | ❌ | Detailed description of the run purpose |
| `type` | Enum | ❌ | Run type: `"Manual"`, `"Automated"`, or `"Scheduled"` (default: `"Automated"`) |
| `status` | Enum | ❌ | Run status: `"Pending"`, `"Running"`, `"Completed"`, or `"Aborted"` (default: `"Pending"`) |
| `environment` | String | ❌ | Target environment (e.g., dev, staging, production) |
| `executedBy` | String (ObjectId) | ❌ | MongoDB ObjectId of the user executing the run |
| `startTime` | Date | ❌ | ISO 8601 date string when run started |
| `endTime` | Date | ❌ | ISO 8601 date string when run completed |

**Auto-generated Fields**:
- `duration`: Number (seconds) - Calculated from startTime and endTime
- `isActive`: Boolean - Default `true`
- `createdAt`: Date - Timestamp of creation
- `updatedAt`: Date - Timestamp of last update

**Response**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "projectId": "507f1f77bcf86cd799439011",
  "name": "Regression Test Run Q1 2026",
  "description": "Full regression suite",
  "type": "Automated",
  "status": "Pending",
  "environment": "staging",
  "executedBy": "507f1f77bcf86cd799439012",
  "startTime": "2026-01-20T10:00:00.000Z",
  "duration": null,
  "isActive": true,
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T10:00:00.000Z"
}
```

---

### GET /runs/:projectId

Get all runs for a specific project.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `projectId` | String (ObjectId) | MongoDB ObjectId of the project |

**Response**: `200 OK` - Array of run objects

---

### GET /runs/project/:projectId

Alternative endpoint to get runs by project (explicit path structure).

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `projectId` | String (ObjectId) | MongoDB ObjectId of the project |

**Response**: `200 OK` - Array of run objects

---

### GET /runs/:id

Get a single run by ID.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the run |

**Response**: `200 OK` - Single run object

**Error Responses**:
- `404 Not Found` - Run not found
- `401 Unauthorized` - Invalid or missing token

---

### PUT /runs/:id

Update an existing run.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the run |

**Request Body** (all fields optional):
```json
{
  "name": "string (min 2 chars)",
  "description": "string",
  "type": "string (enum)",
  "status": "string (enum)",
  "environment": "string",
  "executedBy": "string (ObjectId)",
  "startTime": "date (ISO 8601)",
  "endTime": "date (ISO 8601)",
  "isActive": "boolean"
}
```

**Response**: `200 OK` - Updated run object

---

### DELETE /runs/:id

Delete a run.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the run |

**Response**: `200 OK` or `204 No Content`

---

### GET /runs/search

Search runs with flexible query parameters.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | String | Search term |
| `fields` | String | Comma-separated field names to search in |

**Example**: `/runs/search?query=regression&fields=name,description`

**Response**: `200 OK` - Array of matching run objects

---

## Tests API

Tests represent individual test case instances within a run, linking test definitions to execution cycles.

### POST /tests

Create a new test instance in a run.

**Request Body**:
```json
{
  "runId": "string (ObjectId, required)",
  "projectId": "string (ObjectId, optional)",
  "testCaseId": "string (ObjectId, required)",
  "suiteId": "string (ObjectId, optional)",
  "sectionId": "string (ObjectId, optional)",
  "title": "string (min 2 chars, required)",
  "status": "string (enum, optional)"
}
```

**Field Details**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `runId` | String (ObjectId) | ✅ | MongoDB ObjectId of the parent run |
| `projectId` | String (ObjectId) | ❌ | MongoDB ObjectId of the project (auto-populated from run) |
| `testCaseId` | String (ObjectId) | ✅ | MongoDB ObjectId of the test case definition |
| `suiteId` | String (ObjectId) | ❌ | MongoDB ObjectId of the test suite |
| `sectionId` | String (ObjectId) | ❌ | MongoDB ObjectId of the test section |
| `title` | String | ✅ | Test title (min 2 characters) |
| `status` | Enum | ❌ | Test status: `"Not Started"`, `"In Progress"`, or `"Completed"` (default: `"Not Started"`) |

**Auto-generated Fields**:
- `isActive`: Boolean - Default `true`
- `createdAt`: Date - Timestamp of creation
- `updatedAt`: Date - Timestamp of last update

**Response**: `201 Created`

---

### GET /tests

Get all tests across all runs.

**Response**: `200 OK` - Array of test objects

---

### GET /tests/run/:runId

Get all tests for a specific run.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | String (ObjectId) | MongoDB ObjectId of the run |

**Response**: `200 OK` - Array of test objects

---

### GET /tests/project/:projectId

Get all tests for a specific project (across all runs).

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `projectId` | String (ObjectId) | MongoDB ObjectId of the project |

**Response**: `200 OK` - Array of test objects

---

### GET /tests/:id

Get a single test by ID.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the test |

**Response**: `200 OK` - Single test object

---

### PUT /tests/:id

Update an existing test.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the test |

**Request Body** (all fields optional):
```json
{
  "title": "string (min 2 chars)",
  "status": "string (enum)",
  "isActive": "boolean"
}
```

**Response**: `200 OK` - Updated test object

---

### DELETE /tests/:id

Delete a test.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the test |

**Response**: `200 OK` or `204 No Content`

---

### GET /tests/search

Search tests with flexible query parameters.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | String | Search term |
| `fields` | String | Comma-separated field names to search in |

**Example**: `/tests/search?query=login&fields=title`

**Response**: `200 OK` - Array of matching test objects

---

## Results API

Results capture the outcome of test executions, including pass/fail status, timing information, and detailed execution logs.

### POST /results

Create a new test execution result.

**Request Body**:
```json
{
  "testId": "string (ObjectId, required)",
  "projectId": "string (ObjectId, optional)",
  "status": "string (enum, optional)",
  "executedBy": "string (ObjectId, optional)",
  "startTime": "date (ISO 8601, optional)",
  "endTime": "date (ISO 8601, optional)",
  "logs": "string (optional)"
}
```

**Field Details**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testId` | String (ObjectId) | ✅ | MongoDB ObjectId of the executed test |
| `projectId` | String (ObjectId) | ❌ | MongoDB ObjectId of the project (auto-populated) |
| `status` | Enum | ❌ | Result status: `"Passed"`, `"Failed"`, `"Blocked"`, `"Skipped"`, or `"Retest"` (default: `"Skipped"`) |
| `executedBy` | String (ObjectId) | ❌ | MongoDB ObjectId of the user who executed the test |
| `startTime` | Date | ❌ | ISO 8601 date string when test execution started |
| `endTime` | Date | ❌ | ISO 8601 date string when test execution completed |
| `logs` | String | ❌ | Detailed execution logs, error messages, or notes |

**Status Values**:
- `"Passed"`: Test executed successfully with all assertions passing
- `"Failed"`: Test executed but one or more assertions failed
- `"Blocked"`: Test could not execute due to blocker
- `"Skipped"`: Test was intentionally skipped
- `"Retest"`: Test needs to be re-executed

**Auto-calculated Fields**:
- `duration`: Number (seconds) - Calculated from startTime and endTime via pre-save hook
- `isActive`: Boolean - Default `true`
- `createdAt`: Date - Timestamp of creation
- `updatedAt`: Date - Timestamp of last update

**Response**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "testId": "507f1f77bcf86cd799439017",
  "projectId": "507f1f77bcf86cd799439011",
  "status": "Passed",
  "executedBy": "507f1f77bcf86cd799439012",
  "startTime": "2026-01-20T10:35:00.000Z",
  "endTime": "2026-01-20T10:36:30.000Z",
  "duration": 90,
  "logs": "Test executed successfully",
  "isActive": true,
  "createdAt": "2026-01-20T10:36:30.000Z",
  "updatedAt": "2026-01-20T10:36:30.000Z"
}
```

---

### GET /results

Get all results across all tests.

**Response**: `200 OK` - Array of result objects

---

### GET /results/test/:testId

Get all results for a specific test (execution history).

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `testId` | String (ObjectId) | MongoDB ObjectId of the test |

**Response**: `200 OK` - Array of result objects

---

### GET /results/project/:projectId

Get all results for a specific project.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `projectId` | String (ObjectId) | MongoDB ObjectId of the project |

**Response**: `200 OK` - Array of result objects

---

### GET /results/:id

Get a single result by ID.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the result |

**Response**: `200 OK` - Single result object

---

### PUT /results/:id

Update an existing result.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the result |

**Request Body** (all fields optional):
```json
{
  "status": "string (enum)",
  "executedBy": "string (ObjectId)",
  "startTime": "date (ISO 8601)",
  "endTime": "date (ISO 8601)",
  "logs": "string",
  "isActive": "boolean"
}
```

**Response**: `200 OK` - Updated result object

---

### DELETE /results/:id

Delete a result.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String (ObjectId) | MongoDB ObjectId of the result |

**Response**: `200 OK` or `204 No Content`

---

### GET /results/search

Search results with flexible query parameters.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | String | Search term |
| `fields` | String | Comma-separated field names to search in |
| `status` | String | Filter by status |

**Example**: `/results/search?status=Failed&logs=timeout`

**Response**: `200 OK` - Array of matching result objects

---

## 📊 Data Models

### Run Model

```typescript
{
  _id: ObjectId,
  projectId: ObjectId (ref: "Project"),
  name: string,
  description?: string,
  type: "Manual" | "Automated" | "Scheduled",
  status: "Pending" | "Running" | "Completed" | "Aborted",
  environment?: string,
  executedBy?: ObjectId (ref: "User"),
  startTime?: Date,
  endTime?: Date,
  duration?: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Test Model

```typescript
{
  _id: ObjectId,
  runId: ObjectId (ref: "Run"),
  projectId: ObjectId (ref: "Project"),
  testCaseId: ObjectId (ref: "TestCase"),
  suiteId?: ObjectId (ref: "Suite"),
  sectionId?: ObjectId (ref: "Section"),
  title: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Result Model

```typescript
{
  _id: ObjectId,
  testId: ObjectId (ref: "Test"),
  projectId: ObjectId (ref: "Project"),
  status: "Passed" | "Failed" | "Blocked" | "Skipped" | "Retest",
  executedBy?: ObjectId (ref: "User"),
  startTime?: Date,
  endTime?: Date,
  duration?: number,
  logs?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server (requires build first)
npm start

# Build Docker image
npm run docker:build

# Start Docker container
npm run docker:up
```

### Project Structure

```
results-service/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config/
│   │   └── index.ts          # Configuration and DB connection
│   ├── controllers/
│   │   ├── result.controller.ts
│   │   ├── run.controller.ts
│   │   └── test.controller.ts
│   ├── models/
│   │   ├── Result.model.ts
│   │   ├── Run.model.ts
│   │   └── Test.model.ts
│   ├── routes/
│   │   ├── result.routes.ts
│   │   ├── run.routes.ts
│   │   └── test.routes.ts
│   └── validation/
│       ├── result.schema.ts
│       ├── run.schema.ts
│       └── test.schema.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── readme.md
```

### Adding New Features

1. **Model**: Define schema in `src/models/`
2. **Validation**: Create Joi schema in `src/validation/`
3. **Controller**: Implement business logic in `src/controllers/`
4. **Routes**: Define endpoints in `src/routes/`
5. **Register**: Add routes to `src/index.ts`

### Testing

Use the provided Postman collection (`results-service.postman_collection.json`) for manual testing:

1. Import the collection into Postman
2. Set environment variable `authToken` with your JWT
3. Set `baseUrl` to your service URL (default: `http://localhost:8084`)
4. Execute requests

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build the image
docker compose build

# Start the service
docker compose up

# Start in detached mode
docker compose up -d

# Stop the service
docker compose down
```

### Docker Configuration

The service runs on port **8084** by default. Configure via `docker-compose.yml`:

```yaml
environment:
  - PORT=8084
  - JWT_SECRET=your_secret_key
  - MONGO_URI=your_mongodb_connection_string
ports:
  - "8084:8084"
```

### Manual Docker Commands

```bash
# Build image
docker build -t results-service .

# Run container
docker run -d \
  -p 8084:8084 \
  -e JWT_SECRET=your_secret \
  -e MONGO_URI=your_mongo_uri \
  --name results-service \
  results-service
```

---

## 🔐 Authentication

All endpoints (except `/health`) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The JWT token should be obtained from your authentication service and must be valid according to the `JWT_SECRET` configured in the environment.

---

## 📝 Example Workflow

### 1. Create a Run
```bash
POST /runs
{
  "projectId": "60d5ec49f1b2c8b1f8e4e1a1",
  "name": "Sprint 23 Regression",
  "type": "Automated",
  "environment": "staging"
}
```

### 2. Add Tests to Run
```bash
POST /tests
{
  "runId": "60d5ec49f1b2c8b1f8e4e1a2",
  "testCaseId": "60d5ec49f1b2c8b1f8e4e1a3",
  "title": "User login test"
}
```

### 3. Record Test Result
```bash
POST /results
{
  "testId": "60d5ec49f1b2c8b1f8e4e1a4",
  "status": "Passed",
  "startTime": "2026-01-20T10:00:00Z",
  "endTime": "2026-01-20T10:01:30Z",
  "logs": "All assertions passed"
}
```

### 4. Update Run Status
```bash
PUT /runs/60d5ec49f1b2c8b1f8e4e1a2
{
  "status": "Completed",
  "endTime": "2026-01-20T11:00:00Z"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### Service won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB is running and accessible
- Verify port 8084 is not already in use

### Authentication failures
- Verify JWT_SECRET matches your auth service
- Check token expiration
- Ensure Bearer token is included in Authorization header

### Database connection errors
- Verify MongoDB URI format
- Check network connectivity to MongoDB
- Ensure database user has proper permissions

---

## 📞 Support

For issues and questions, please open an issue on the repository or contact the development team.

---

**Built with ❤️ for QA Teams**
