# LinkVolt 

**LinkVolt** is a secure, full-stack file and text sharing application designed for privacy and control. It allows users to upload content and generate shareable links with security features like expiration times, view limits, and password protection.

## Features

### Core Functionality
- **File & Text Sharing:** Upload files (images, PDFs, archives) or paste text/code snippets.
- **Auto-Expiration:** Set links to automatically expire after a specific date and time.
- **Unique Links:** Generates short, unique URLs for easy sharing.
- **Max View Limits:** Restrict the number of times a link can be accessed before it expires.
- **Password Protection:** Secure your links with a custom password (hashed using bcrypt).
- **Input Validation:** Strict allow-list for file types (JPG, PNG, PDF, ZIP, etc.) and size limits (5MB) to prevent abuse.

---

## Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Axios, React Router DOM
- **Backend:** Node.js, Express.js, Node-cron
- **Database:** SQLite,Supabase Storage(cloud storage for uploaded files)
- **Authentication:** JWT, Bcrypt.js
- **File Handling:** Multer

---

## Installation & Setup

```bash
git clone https://github.com/TejaSanjeev/LinkVolt-drive-.git
cd LinkVolt-drive-

cd server
npm install
npx nodemon server.js


cd client
npm install
npm run dev

```



## API Overview

The backend uses Express.js. It has these main endpoints:

* **Authentication**: Use `POST /api/auth/register` to make accounts. Use `POST /api/auth/login` to get a JWT token.
* **Upload Logic**: `POST /api/upload` works for text and files. It saves text to the database. It sends files to Supabase. Then it makes a unique ID for the link.
* **Content Retrieval**: 
    * `GET /api/:id` checks if the link is good. It sees if a password is needed.
    * `POST /api/:id/verify` shows the content. It adds 1 to the view count.
* **File Downloads**: `GET /api/file/download/:filename` sends you to the Supabase link safely.
* **User Management**: `GET /api/user/uploads` shows your history if logged in. `DELETE /api/user/files/:id` removes data from DB and cloud.

---

##  Design Decisions

* **Supabase for Storage**: We use Supabase for storage. Files stay safe if the server restarts. It is easy to deploy.
* **5-Minute Cleanup**: A task runs every 5 minutes. It cleans up old links. It deletes links that have expired.
* **Security**: User passwords are hashed using bcrypt.


---

##  Assumptions and Limitations

* **File Size Limit**: Files can be up to 5MB. 
* **Cleanup Timing**: Links expire at the set time. But they stay in the database until the cleanup runs.
* **Single File Sharing**: You can share only one file or text per link.
* **Internet Connection**: Files are in the cloud. The server needs internet to upload and delete.