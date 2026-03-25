import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Contact */}
        <Route path="/contact" element={<Contact />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:email" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
