import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import "../styles/login.css";


function Signup(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const signup = async () => {

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if(error){
      alert(error.message);
      return;
    }

    alert("Signup successful!");

    navigate("/login");

  };

  const googleSignup = async () => {

    await supabase.auth.signInWithOAuth({
      provider:"google"
    });

  };

  const appleSignup = async () => {

    await supabase.auth.signInWithOAuth({
      provider:"apple"
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
          Create an account and start collaborating with
          AI-powered brainstorming boards.
        </p>

        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
          alt="team collaboration"
        />

      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-card">

          <h2>Create Account</h2>

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

          <button className="login-btn" onClick={signup}>
            Signup
          </button>

          <div className="divider">
            OR
          </div>

          <button className="google-btn" onClick={googleSignup}>
            <FcGoogle size={20}/>
            Signup with Google
          </button>

          <button className="apple-btn" onClick={appleSignup}>
            <FaApple size={18}/>
            Signup with Apple
          </button>

          <p className="signup-link">
            Already have an account? <a href="/login">Login</a>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;