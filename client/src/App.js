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

// Admin Dashboard components
import Dashboard from "./pages/dashboard/admin/Dashboard";

// Student Dashboard components
import UserDashboard from "./pages/dashboard/user/userDashboard";

function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (!currentUser) {
    return navigate("/login", { replace: true });
  }

  return children;
}

function PublicLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        {/* <Route path="/services" element={<Services />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function AdminDashboardLayout() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
    </Routes>
  );
}

function UserDashboardLayout() {
  return (
    <Routes>
      <Route index element={<UserDashboard />} />
      <Route path="/addtask" element={<AddTask />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/*" element={<PublicLayout />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard/*"
            element={
              <PrivateRoute>
                <AdminDashboardLayout />
              </PrivateRoute>
            }
          />

          {/* User Dashboard */}
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
