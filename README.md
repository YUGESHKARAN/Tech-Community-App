# Tech. Community App


[![License: MIT](https://img.shields.io/github/license/YUGESHKARAN/Node-Blog-App)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![GitHub forks](https://img.shields.io/github/forks/YUGESHKARAN/Node-Blog-App?style=social)](https://github.com/YUGESHKARAN/Node-Blog-App/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/YUGESHKARAN/Node-Blog-App)](https://github.com/YUGESHKARAN/Node-Blog-App/commits/main)
[![Issues](https://img.shields.io/github/issues/YUGESHKARAN/Node-Blog-App)](https://github.com/YUGESHKARAN/Node-Blog-App/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/YUGESHKARAN/Node-Blog-App)](https://github.com/YUGESHKARAN/Node-Blog-App/pulls)
[![Contributors](https://img.shields.io/github/contributors/YUGESHKARAN/Node-Blog-App)](https://github.com/YUGESHKARAN/Node-Blog-App/graphs/contributors)

**Welcome to the Tech. Community App!**

E-Learning a& collaborative platform designed for universities and colleges, focusing on knowledge sharing and community building. The platform enables student developers to connect, collaborate, and engage through sharing their tech works, knowledges and findings, all within their institution. Developers can interact, clarify doubts via discussion section. The platform includes role-based interfaces for Students, Coordinators, and Admins to manage content, moderation, and community participation.

---
## Key Features

* **User Authentication** –Secure registration and login with role-based access using JWT.
* [**Knowledge Hub Assistant**](https://github.com/YUGESHKARAN/Assistant_Knowledge_Hub) – In-post AI assistant that provides contextual explanations, related posts, videos, and suggested follow-up queries.
* [**DraftMate AI**](https://github.com/YUGESHKARAN/blogChat-backend) – Content drafting assistant to refine and structure post descriptions before publishing.
* **Post Management** – Create, edit, and publish technical posts within the community.
* **Playlists Management** – Organize and save curated collections of posts for structured learning.
* [**Discussions**](https://github.com/YUGESHKARAN/Tech-Discussion.io.git) – Engage with the community through threaded discussions on posts.
* **Announcements** – Coordinators and admins can publish institutional or community updates.
* **Notifications** – Real-time alerts for recommended feeds and comments.
* [**Network Recommendation**](https://github.com/YUGESHKARAN/recommendation-system) – A graph structured author recommendation system to build connections.
---

## Student Interface

- **Explore Technical Content**: Browse, learn, and engage with posts across tech communities.
- **Interactive Discussions**: Comment on posts and join lively discussions.
- **Personalized Experience**: Follow favorite communities and authors, and receive tailored notifications.
- **Stay Informed**: Get real-time announcements about events and sessions.

## Coordinator Interface

- **Content Creation & Management**: Publish, edit, or delete technical posts.
- **AI-Powered Grammar Checker**: Ensure content quality using integrated AI tools.
- **Event Management**: Plan and schedule announcements for meetings and events.

## Admin Interface

- **Platform Oversight**: Manage users, roles, and permissions.
- **Activity Monitoring**: Verify and monitor student and coordinator activities.
- **Comprehensive Control**: Oversee and configure all aspects of the platform.

---


## Monorepo Structure

Both backend and frontend are organized for modularity and scalability:

```
Node-Blog-App/
├── backend/    # Node.js + Express + AWS -S3 + MongoDB 
├── frontend/   # React.js + Tailwind CSS 
├── README.md
└── ...
```

---

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React.js, Tailwind CSS
- **Image Storage:** AWS S3

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
   ```
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   PORT=5000
   AWS_BUCKET_NAME=your_bucket_name
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_aws_region
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

1. Create a `.env` file in the `frontend/` directory if needed (e.g., for API base URL).
2. Start the frontend server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:5173) in your browser.

---

## Contributing

Contributions are welcome!  
Fork the repository and submit a pull request, or open an issue to discuss significant changes.

## License

This project is licensed under the MIT License.

---
