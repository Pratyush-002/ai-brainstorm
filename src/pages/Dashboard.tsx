import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [boards,setBoards] = useState<any[]>([]);
  const [name,setName] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{

    fetch("http://localhost:5000/boards")
      .then(res=>res.json())
      .then(data=>setBoards(data));

  },[]);

  const createBoard = async () => {

    const res = await fetch("http://localhost:5000/create-board",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ name })
    });

    const data = await res.json();

    navigate(`/board/${data.id}`);

  };

  return (
    <div style={{padding:"40px"}}>

      <h1>My Boards</h1>

      <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        placeholder="New board name"
      />

      <button onClick={createBoard}>
        Create Board
      </button>

      <div style={{marginTop:"40px"}}>

        {boards.map(board=>(
          <div
            key={board.id}
            style={{cursor:"pointer",marginBottom:"10px"}}
            onClick={()=>navigate(`/board/${board.id}`)}
          >
            📌 {board.name}
          </div>
        ))}

      </div>

    </div>
  );

}

export default Dashboard;