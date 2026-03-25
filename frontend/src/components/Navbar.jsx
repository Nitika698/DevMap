import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 shadow-md">
      {/* Logo */}
      <h1 className="text-2xl font-bold text-blue-600">DevMap</h1>

      {/* Links */}
      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-500">Home</Link>
        <a href="#features" className="hover:text-blue-500">Features</a>
        <a href="#about" className="hover:text-blue-500">About</a>
        <a href="#contact" className="hover:text-blue-500">Contact</a>
      </div>

      {/* Buttons */}
      <div className="space-x-4">
        <Link to="/login" className="px-4 py-2 border rounded">
          Log In
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;