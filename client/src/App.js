import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import necessary components

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AddTask from "./pages/dashboard/user/TaskManagement/AddTask";
import MyTasks from "./pages/dashboard/user/TaskManagement/MyTasks";

import { ForgotPassword } from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddUser from "./pages/dashboard/admin/AddUser";
import EditUser from "./pages/dashboard/admin/EditUser";
import UserDetails from "./pages/dashboard/admin/UserDetails";
import Dashboard from "./pages/dashboard/admin/Dashboard";
import UserDashboard from "./pages/dashboard/user/userDashboard";
import UserProfile from "./pages/dashboard/admin/UserProfile";

import AddReminder from "./pages/dashboard/user/ReminderManagement/AddReminder";
import MyReminders from "./pages/dashboard/user/ReminderManagement/MyReminders";
// import RemindersHistory from "./pages/dashboard/user/ReminderManagement/RemindersHistory";
import Notifications from "./pages/dashboard/user/ReminderManagement/Notifications";

function PrivateRoute({ children }) {
  const navigate = useNavigate(); // Hook for navigation

  const { currentUser, loading } = useAuth(); // Get user authentication status

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while authentication is being checked
  }

  if (!currentUser) {
    return navigate("/login", { replace: true });
  }

  return children; // Render children if user is authenticated
}

// Layout for public-facing pages
function PublicLayout() {
  return (
    <>
      {/* Display Header */}
      <Header />
      {/* Define routes for public pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        {/* <Route path="/services" element={<Services />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      {/* Display Footer */}
      <Footer />
    </>
  );
}

// Layout for the admin dashboard
function AdminDashboardLayout() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="/add" element={<AddUser />} />
      <Route path="/edit/:id" element={<EditUser />} />
      <Route path="/users" element={<UserDetails />} />
      <Route path="/profile/:id" element={<UserProfile />} />
    </Routes>
  );
}

// Layout for the user dashboard
function UserDashboardLayout() {
  return (
    <Routes>
      <Route index element={<UserDashboard />} />
      <Route path="/addtask" element={<AddTask />} />
      <Route path="/mytasks" element={<MyTasks />} />
      <Route path="/profile" element={<UserProfile />} />

      <Route path="/addReminder" element={<AddReminder />} />
      <Route path="/myReminders" element={<MyReminders />} />
      <Route path="/myReminders" element={<MyReminders />} />
      {/* <Route path="/remindersHistory" element={<RemindersHistory />} /> */}
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/*" element={<PublicLayout />} />

          {/* Admin Dashboard - Protected Route */}
          <Route
            path="/admin/dashboard/*"
            element={
              <PrivateRoute>
                <AdminDashboardLayout />
              </PrivateRoute>
            }
          />

          {/* User Dashboard - Protected Route */}
          <Route
            path="/user/dashboard/*"
            element={
              <PrivateRoute>
                <UserDashboardLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
