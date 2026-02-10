# Complaint Tracker

A full-stack web application designed for tracking and managing complaints. This project provides a user-friendly interface for raising complaints and a secure admin portal for managing them.

## 🚀 Features

### **User Portal**
- **Raise Complaints:** Users can enter their name, email, issue title, and a detailed description to lodge a complaint.
- **Unique ID Generation:** Every complaint is automatically assigned a unique 6-digit numeric ID upon submission.

### **Admin Portal**
- **View All Complaints:** Admissions can see a comprehensive list of all lodged complaints.
- **Update Status:** Admins can change the status of a complaint (e.g., pending to resolved).
- **Delete Complaints:** Secure removal of complaints from the system.
- **Authorization:** Protected administrative actions using middleware.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, Vanilla CSS, JavaScript
- **API Style:** RESTful API
- **Data Persistence:** In-memory storage (Reset on server restart)

## 📂 Project Structure

```text
├── controllers/          # Request handling logic
├── frontend/             # Client-side files (HTML, CSS, JS)
├── middleware/           # Custom middleware (auth, logging)
├── routes/               # API route definitions
├── app.js               # Express application configuration
├── server.js            # Entry point for starting the server
└── package.json         # Project dependencies and metadata
```

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd project7
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - User Portal: `http://localhost:3000/index.html`
   - Admin Portal: `http://localhost:3000/admin.html`

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/complaints` | Fetch all complaints | No |
| **GET** | `/complaints/:id` | Fetch a single complaint by ID | No |
| **POST** | `/complaints` | Submit a new complaint | No |
| **PUT** | `/complaints/:id` | Update complaint status | Yes |
| **DELETE** | `/complaints/:id` | Delete a complaint | Yes |

---
*Created as part of the MERN Stack development course.*
