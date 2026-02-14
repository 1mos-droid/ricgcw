# RICGCW Church Management System (CMS)

## Project Overview

The RICGCW Church Management System is a comprehensive platform designed to assist the Redeemed Christian Church of God, Word Assembly (RICGCW) in managing its members, attendance, financials, and events efficiently. This system provides a user-friendly interface for administrative tasks, allowing the church to streamline its operations and focus more on its core mission.

## Features

-   **Dashboard:** An overview of key church activities and statistics.
-   **Member Management:** Add, view, and manage church member profiles.
-   **Attendance Tracking:** Record and monitor attendance for various services and events.
-   **Financials:** Manage income and expenses, offering insights into the church's financial health.
-   **Events Management:** Plan, schedule, and track church events.
-   **Reports:** Generate various reports based on collected data.
-   **User Management:** Administer user accounts and roles within the system.
-   **Quick Switch:** Easily navigate between different sections of the application.
-   **Help & Settings:** Access support and configure application settings.
-   **Bible Studies:** Manage and track bible study groups and progress.

## Technologies Used

### Frontend

-   **React 19:** A JavaScript library for building user interfaces.
-   **Vite:** A fast build tool that provides a lightning-fast development experience.
-   **Material UI (MUI):** A comprehensive suite of UI tools to help ship new features faster.
-   **React Router DOM:** Declarative routing for React.
-   **Axios:** Promise-based HTTP client for the browser and Node.js.
-   **Framer Motion:** A production-ready motion library for React.
-   **date-fns:** Modern JavaScript date utility library.
-   **MUI X DataGrid:** Advanced data grid component for React.

### Backend

-   **Node.js:** JavaScript runtime environment.
-   **Express:** Fast, unopinionated, minimalist web framework for Node.js.
-   **CORS:** Middleware to enable Cross-Origin Resource Sharing.
-   **Body-parser:** Node.js body parsing middleware.
-   **Flat-file Database (db.json):** A simple JSON file used for data persistence in a development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/en/) (LTS version recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd ricgcw
    ```

2.  **Install Frontend Dependencies:**
    Navigate to the root directory of the project and install dependencies:
    ```bash
    npm install
    # or yarn install
    ```

3.  **Install Backend Dependencies:**
    Navigate to the `backend` directory and install its dependencies:
    ```bash
    cd backend
    npm install
    # or yarn install
    cd ..
    ```

## Running the Application

To run the full-stack application, you need to start both the backend server and the frontend development server.

### 1. Start the Backend Server

The backend server will listen for API requests, typically on port `3002`.

```bash
cd backend
npm start
```
You should see a message like: `Backend server listening at http://localhost:3002`

### 2. Start the Frontend Development Server

The frontend application will run in your browser, typically on port `5173`.

```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the address shown in your console) to view the application.

## Linting

To check for code style and potential errors in the frontend:

```bash
npm run lint
```

## Building for Production

To create a production-ready build of the frontend application:

```bash
npm run build
```
This will generate optimized static assets in the `dist/` directory.

## Project Structure

-   `backend/`: Contains the Node.js/Express backend server and its `db.json` data store.
-   `src/`: Houses the React frontend application source code.
    -   `assets/`: Static assets for the frontend.
    -   `components/`: Reusable React components.
    -   `pages/`: Individual pages of the application.
    -   `routes/`: Frontend routing configuration.
-   `public/`: Publicly accessible static files for the frontend.
-   `dist/`: Production build output of the frontend.
-   `node_modules/`: Installed Node.js modules.

## Contributions

Contributions are welcome! Please follow the standard fork-and-pull request workflow.

## License

This repository uses the MIT lincense