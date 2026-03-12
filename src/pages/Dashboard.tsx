import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import "../styles/dashboard.css";

function Dashboard() {

  const [boards,setBoards] = useState<any[]>([]);
  const [name,setName] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{

    fetch("https://ai-brainstrom-backend.onrender.com/boards")
      .then(res=>res.json())
      .then(data=>setBoards(data));

  },[]);

  const createBoard = async () => {

    const res = await fetch("https://ai-brainstrom-backend.onrender.com/create-board",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ name })
    });

    const data = await res.json();

    navigate(`/board/${data.id}`);

  };

  const deleteBoard = async (id:string)=>{

    await fetch(`https://ai-brainstrom-backend.onrender.com/delete-board/${id}`,{
      method:"DELETE"
    });

    setBoards(boards.filter(b=>b.id!==id));

  };

  const logout = async ()=>{

    await supabase.auth.signOut();
    window.location.href="/login";

  };

  return (

    <div className="dashboard">

      {/* NAVBAR */}

      <div className="navbar">

        <h2>AI Brainstorm</h2>

        <div className="user-profile">

          <img
            src="https://i.pravatar.cc/40"
            alt="user"
          />

          <button onClick={logout}>Logout</button>

        </div>

      </div>


      {/* HERO SECTION */}

      <div className="hero">

        <div className="hero-text">

          <h1>Create your next big idea</h1>

          <div className="create-board">

            <input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Board name"
            />

            <button onClick={createBoard}>
              Create Board
            </button>

          </div>

        </div>

        <img
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984"
          alt="workspace"
        />

      </div>


      {/* BOARDS */}

      <div className="boards-grid">

        {boards.map(board=>(

          <div
            key={board.id}
            className="board-card"
          >

            <div
              className="board-title"
              onClick={()=>navigate(`/board/${board.id}`)}
            >
              📌 {board.name}
            </div>

            <button
              className="delete-btn"
              onClick={()=>deleteBoard(board.id)}
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Dashboard;