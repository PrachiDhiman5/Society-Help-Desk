# Society Help Desk (MERN Stack)

A professional full-stack web application designed for tracking and managing complaints within a community or organization. This project leverages the MERN stack (MongoDB, Express, Node.js) to provide a robust backend and a dynamic, responsive frontend.

## 🚀 Features

### **User Portal**
- **Raise Complaints:** Users can lodge complaints with details like name, email, flat number, wing, and category.
- **Unique ID Generation:** Every complaint is automatically assigned a professional unique ID (e.g., `INC-123456789`).
- **Splash Screen:** A welcoming entry point with resident and admin selection.

### **Admin Portal**
- **Management Dashboard:** A centralized view for administrators to manage all lodged complaints.
- **Update Status:** Change complaint status (Pending, Resolved, Rejected) with admin responses.
- **Secure Deletion:** Soft-delete functionality to keep the system clean.
- **Authorization:** Protected administrative routes and actions.

### **Authentication & Security**
- **Google OAuth:** One-tap login for residents (Verified account required).
- **JWT Authentication:** Secure token-based access for all sessions.
- **Password Hashing:** Using `bcryptjs` for secure local admin/user storage.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla CSS, JavaScript (Dynamic UI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Authentication:** Google Auth Library, JSON Web Tokens (JWT)
- **Security:** BcryptJS (Password protection)
- **Environment:** Dotenv (Configuration management)

## 📂 Project Structure

```text
├── config/              # Database connection settings
├── controllers/         # Business logic for routes (auth, complaints)
├── frontend/            # Client-side files (HTML, CSS, JS, Assets)
├── middleware/          # Auth and logging middleware
├── models/              # Mongoose schemas (User, Complaint)
├── routes/              # API route definitions
├── app.js               # Express app configuration
├── server.js            # Entry point
└── .env                 # Environment variables
```

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Project6_Online_Complaint_Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root and add:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   ADMIN_PASSWORD=your_admin_password
   ```

4. **Google OAuth Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project and set up OAuth 2.0 Client ID.
   - Add `http://localhost:3000` to Authorized JavaScript origins.
   - Copy the Client ID to your `.env` file.

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Access the application:**
   - App Home: `http://localhost:3000/` (Splash Screen)

## 🔌 API Endpoints

### Auth Routes
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register`| Register new resident | No |
| **POST** | `/api/auth/login` | Local login (Admin/User) | No |
| **POST** | `/api/auth/google` | Google OAuth login | No |
| **POST** | `/api/auth/logout` | Terminate session | Yes |

### Complaint Routes
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/complaints` | Fetch all active complaints | No |
| **POST** | `/complaints` | Submit a new complaint | No |
| **PUT** | `/complaints/:id` | Update status/response | Yes |
| **DELETE** | `/complaints/:id` | Soft-delete a complaint | Yes |

## 🔜 Upcoming Updates
- [ ] **UI Refresh:** Modernizing the interface with advanced CSS and animations.
- [ ] **Enhanced Auth Flow:** Fully integrated Signup/Login flow for residents and admins.
- [ ] **Real-time Notifications:** Automated status updates via email.

---
*Developed with focus on scalability and user experience.*

