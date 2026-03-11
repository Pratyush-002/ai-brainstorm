import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import "../styles/login.css";

function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const login = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(error){
      alert(error.message);
      return;
    }

    navigate("/");
  };

  const googleLogin = async () => {

    await supabase.auth.signInWithOAuth({
      provider: "google"
    });

  };

  const appleLogin = async () => {

    await supabase.auth.signInWithOAuth({
      provider: "apple"
    });

  };

  return (
    <div className={`login-page ${darkMode ? "dark" : ""}`}>

      {/* LEFT SIDE */}
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        >
        {darkMode ? "☀" : "🌙"}
        </button>
      
      <div className="login-left">

        <h1>AI Brainstorm</h1>

        <p>
          Collaborate with your team and generate startup ideas
          with AI-powered brainstorming boards.
        </p>

        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978"
          alt="brainstorm"
        />

      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-card">

          <h2>Welcome Back</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button className="login-btn" onClick={login}>
            Login
          </button>

          <div className="divider">
            OR
          </div>

          <button className="google-btn" onClick={googleLogin}>
            <FcGoogle size={20}/>
            Continue with Google
          </button>

          <button className="apple-btn" onClick={appleLogin}>
            <FaApple size={18}/>
            Continue with Apple
          </button>

          <p className="signup-link">
            Don't have an account? <a href="/signup">Signup</a>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;