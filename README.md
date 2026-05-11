# IT Asset Management - Frontend

This is the React-based frontend for the IT Asset Management System, built with Vite and Material UI.

## 🎨 Design Philosophy
- **Clean & Professional**: Indigo-based theme with a focus on data readability.
- **Feedback-First**: Every action (Assign, Return, Delete, Request) provides immediate visual feedback via MUI Snackbars.
- **Role-Based UI**: The interface dynamically adapts (Sidebar items, Action buttons) based on the logged-in user's role.

## 🛠️ Technology Stack
- **React 18**: Component-based UI.
- **Vite**: Ultra-fast build tool.
- **Material UI (MUI)**: Enterprise-grade component library.
- **Recharts**: Data visualization for the dashboard.
- **Axios**: API communication with automated token handling.

## 📂 Key Folders
- `/src/pages`: Main view components (Dashboard, AssetList, Staff, etc.).
- `/src/components`: Shared components like the Layout wrapper.
- `/src/api`: Axios instance configured with interceptors for JWT.
- `/src/theme.js`: Global MUI theme customization.

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🔑 Test Credentials
- **Admin**: `admin@kenora.lk` / `password123`
- *Note: These fields are pre-filled on the login page for convenience.*
