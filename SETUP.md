## Monorepo Structure

Frontend and Backend are deployed and scaled independently in service level _(Application is coupled with other micro-services outlined in the_ **Key Features** _section)_:

```
Node-Blog-App/
├── backend/    # Node.js + Express + Redis + AWS -S3 + MongoDB 
├── frontend/   # React.js + Tailwind CSS 
├── README.md
└── ...
```

---

## Tech Stack

- **Backend:** Node.js, Express, JWT, MongoDB, Mongoose
- **Frontend:** React.js, Tailwind CSS
- **Storage:** AWS S3
- **Caching:** Redis

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [MongoDB](https://www.mongodb.com/) (local or cloud)
- [AWS Account](https://aws.amazon.com/) (for S3 integration)

### Backend Setup

```bash
cd backend
npm install
```

1. Create a `.env` file in the `backend/` directory:
   ```env
   # Database credentials
   MONGODB_URI = your_mongodb_connection_string
   REDIS_URL = your_redis_connection_string

   # E-Mail credentials
   EMAIL_PROVIDER = providers_email_id
   EMAIL_PASS = providers_email_pass_key

   # AWS credentials
   AWS_BUCKET_NAME = your_bucket_name
   AWS_ACCESS_KEY_ID = your_access_key
   AWS_SECRET_ACCESS_KEY = your_secret_key
   AWS_REGION = your_aws_region

   # Authentication key for auth-middleware (secure client access)
   JWT_TOKEN_ACCESS_KEY = your_jwt_hashKey
   ```
2. Start the backend server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Frontend Setup

```bash
cd frontend
npm install
```

1. Create a `.env` file in the `frontend/`:
   ```env
   # Micro-services URLs
   VITE_CHATBOT_URL= drafMate_assistant_url
   VITE_WEBSOCKET_URL = discussion.io_url
   VITE_TECH_ASSISTANT_URL = assistant_knowledge_hub_url
   VITE_RECOMMENDATION_URL = author_recommendation_surl

   # Local encryption key
   VITE_STORAGE_KEY = your_hashKey # your custome hashKey for localStroage encryption
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---
