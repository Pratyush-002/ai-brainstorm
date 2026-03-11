import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import StickyNote from "../components/StickyNote";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { supabase } from "../lib/supabase";

type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
  roomId: string;
  color?: string;
};

function Room() {
  const { roomId } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [topic, setTopic] = useState("");
  const [cursors, setCursors] = useState<any>({});
  const [summary, setSummary] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [startupPlan,setStartupPlan] = useState("");
  const [boardName,setBoardName] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);

useEffect(() => {
  if (!roomId) return;

  socket.emit("join-room", roomId);

  socket.on("note-added", (note: Note) => {
    setNotes((prev) => [...prev, note]);
  });

  socket.on("note-moved", (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id
          ? { ...note, x: updatedNote.x, y: updatedNote.y }
          : note
      )
    );
  });

  socket.on("cursor-moved", (data) => {
    setCursors((prev: any) => ({
      ...prev,
      [data.userId]: { x: data.x, y: data.y }
    }));
  });

socket.on("load-events", (events: any[]) => {

  const rebuiltNotes: Record<string, Note> = {};

  events.forEach((event) => {

    switch (event.type) {

      case "note_created":
        rebuiltNotes[event.payload.id] = event.payload;
        break;

      case "note_moved":
        if (rebuiltNotes[event.payload.id]) {
          rebuiltNotes[event.payload.id].x = event.payload.x;
          rebuiltNotes[event.payload.id].y = event.payload.y;
        }
        break;

      case "note_deleted":
        delete rebuiltNotes[event.payload.id];
        break;

    }

  });

  setNotes(Object.values(rebuiltNotes));

});

  socket.on("load-notes", (serverNotes: Note[]) => {
    setNotes(serverNotes);
  });

  socket.on("users-update", (users) => {
      setUsers(users);
    });

    socket.on("note-deleted", (deletedNote) => {

        setNotes((prev) =>
            prev.filter((note) => note.id !== deletedNote.id)
        );

    });

    fetch(`http://localhost:5000/boards`)
    .then(res => res.json())
    .then(data => {

      const board = data.find((b:any)=>b.id === roomId);

      if(board){
        setBoardName(board.name);
      }

    });

  return () => {
    socket.off("note-added");
    socket.off("note-moved");
    socket.off("cursor-moved");
    socket.off("load-notes");
    socket.off("users-update");
    socket.off("load-events");
    socket.off("note-deleted");
  };

}, [roomId]);

  useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {

    socket.emit("cursor-move", {
      roomId,
      x: e.clientX,
      y: e.clientY,
      userId: socket.id
    });

  };

  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };

}, [roomId]);

const getUser = (id: string) => {
  return users.find((u) => u.id === id);
};

  const addNote = () => {
    if (!roomId) return;

    const newNote: Note = {
        id: crypto.randomUUID(),
        text: "New Idea",
        x: Math.random() * 500,
        y: Math.random() * 400,
        roomId,
        color: "#fff475"
        };

    // socket.emit("note-created", newNote);
    socket.emit("add-note", newNote);
  };

  const generateIdeas = async () => {

  const res = await fetch("http://localhost:5000/generate-ideas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic }),
  });

  const data = await res.json();

  data.ideas.forEach((idea: string) => {

    const newNote = {
      id: crypto.randomUUID(),
      text: idea,
      x: Math.random() * 500,
      y: Math.random() * 400,
      roomId,
    };

    socket.emit("add-note", newNote);

  });

};

const moveNote = (id: string, x: number, y: number) => {

  const movingNotes = selectedNotes.length
    ? notes.filter((n) => selectedNotes.includes(n.id))
    : notes.filter((n) => n.id === id);

  movingNotes.forEach((note) => {

    const updated = { ...note, x, y };

    socket.emit("move-note", updated);

  });

};
const clusterIdeas = async () => {

  const res = await fetch("http://localhost:5000/cluster-notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ notes })
  });

  const data = await res.json();

  alert(data.clusters);

};

const summarizeBoard = async () => {

  const res = await fetch("http://localhost:5000/summarize-board", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ notes })
  });

  const data = await res.json();

  setSummary(data.summary);

};

const undoBoard = async () => {

  await fetch("http://localhost:5000/undo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ roomId })
  });

  socket.emit("join-room", roomId);

};


const generateStartupPlan = async () => {

  const res = await fetch("http://localhost:5000/generate-startup-plan",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({ notes })
  });

  const data = await res.json();

  setStartupPlan(data.plan);

};

const deleteNote = (id: string) => {

  if (!roomId) return;

  const note = notes.find((n) => n.id === id);

  if (!note) return;

  socket.emit("delete-note", note);

};

const changeNoteColor = (id: string, color: string) => {

  setNotes((prev) =>
    prev.map((note) =>
      note.id === id ? { ...note, color } : note
    )
  );

};

const renameBoard = async () => {

  await fetch(`http://localhost:5000/boards/${roomId}`,{
    method:"PATCH",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      name: boardName
    })
  });

};

const toggleSelectNote = (id: string, shiftKey: boolean) => {

  if (!shiftKey) {
    setSelectedNotes([id]);
    return;
  }

  setSelectedNotes((prev) =>
    prev.includes(id)
      ? prev.filter((n) => n !== id)
      : [...prev, id]
  );

};

const startSelection = (e: React.MouseEvent) => {

  if (e.target !== e.currentTarget) return;

  const startX = e.clientX;
  const startY = e.clientY;

  setIsSelecting(true);

  setSelectionBox({
    x: startX,
    y: startY,
    width: 0,
    height: 0
  });

};

const updateSelection = (e: React.MouseEvent) => {

  if (!isSelecting || !selectionBox) return;

  const width = e.clientX - selectionBox.x;
  const height = e.clientY - selectionBox.y;

  setSelectionBox({
    ...selectionBox,
    width,
    height
  });

};

const endSelection = () => {

  if (!selectionBox) return;

  const selected = notes
    .filter((note) => {

      return (
        note.x > selectionBox.x &&
        note.x < selectionBox.x + selectionBox.width &&
        note.y > selectionBox.y &&
        note.y < selectionBox.y + selectionBox.height
      );

    })
    .map((n) => n.id);

  setSelectedNotes(selected);

  setIsSelecting(false);
  setSelectionBox(null);

};

const logout = async () => {

  await supabase.auth.signOut();

  window.location.href = "/login";

};


return (
  <div style={{ height: "100vh", position: "relative" }}>

    {/* BOARD TITLE */}
    <div
      style={{
        position: "fixed",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000
      }}
    >
      <input
        value={boardName}
        onChange={(e) => setBoardName(e.target.value)}
        onBlur={renameBoard}
        style={{
          fontSize: "20px",
          border: "none",
          fontWeight: "bold",
          textAlign: "center",
          background: "transparent"
        }}
      />
    </div>


    {/* TOOLBAR */}
    <div style={{
    position: "fixed",
    top: 20,
    left: 20,
    zIndex: 10,
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  }}>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter brainstorming topic"
      />

      <button onClick={generateIdeas}>Generate AI Ideas</button>
      <button onClick={addNote}>Add Note</button>
      <button onClick={clusterIdeas}>Cluster Ideas</button>
      <button onClick={summarizeBoard}>Summarize Board</button>
      <button onClick={undoBoard}>Undo</button>
      <button onClick={generateStartupPlan}>Generate Startup Plan</button>
      <button onClick={logout}>Logout</button>
    </div>

    {/* USER PRESENCE */}
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        display: "flex",
        gap: "10px",
        background: "white",
        padding: "8px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: 1000
      }}
    >
      {users.map((user) => (
        <div
          key={user.id}
          style={{
            background: "#4f46e5",
            color: "white",
            padding: "6px 10px",
            borderRadius: "20px",
            fontSize: "12px"
          }}
        >
          👤 {user.name}
        </div>
      ))}
    </div>

    {/* AI SUMMARY PANEL */}
    {summary && (
      <div
        style={{
          position: "fixed",
          right: 20,
          top: 80,
          width: "300px",
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}
      >
        <h3>AI Summary</h3>
        <p>{summary}</p>
      </div>
    )}

    {startupPlan && (
  <div
    style={{
      position:"fixed",
      right:20,
      bottom:20,
      width:"350px",
      background:"white",
      padding:"15px",
      borderRadius:"10px",
      boxShadow:"0 4px 10px rgba(0,0,0,0.2)",
      maxHeight:"400px",
      overflow:"auto"
    }}
  >
    <h3>Startup Plan</h3>
    <pre style={{whiteSpace:"pre-wrap"}}>
      {startupPlan}
    </pre>
  </div>
)}

    {/* INFINITE CANVAS */}
    <TransformWrapper
      initialScale={1}
      minScale={0.3}
      maxScale={3}
      wheel={{ step: 0.1 }}
    >
      <TransformComponent>
        <div
        onMouseDown={startSelection}
        onMouseMove={updateSelection}
        onMouseUp={endSelection}
          style={{
            width: "3000px",
            height: "2000px",
            position: "relative",
            backgroundColor: "#f5f5f5",
            backgroundImage:
                "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "40px 40px"
            }}
        >

          {/* STICKY NOTES */}
          {notes.map((note) => (
            <StickyNote
                key={note.id}
                id={note.id}
                text={note.text}
                x={note.x}
                y={note.y}
                color={note.color}
                selected={selectedNotes.includes(note.id)}
                onSelect={toggleSelectNote}
                onMove={moveNote}
                onDelete={deleteNote}
                onColorChange={changeNoteColor}
                />
          ))}

          {selectionBox && (
              <div
                style={{
                  position: "absolute",
                  left: selectionBox.x,
                  top: selectionBox.y,
                  width: selectionBox.width,
                  height: selectionBox.height,
                  background: "rgba(99,102,241,0.2)",
                  border: "1px dashed #6366f1",
                  pointerEvents: "none"
                }}
              />
            )}

          {/* CURSORS */}
         {Object.entries(cursors).map(([id, cursor]: any) => {

                const user = getUser(id);

                if (!user) return null;

                return (
                    <div
                    key={id}
                    style={{
                        position: "absolute",
                        left: cursor.x,
                        top: cursor.y,
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                    >
                    <div
                        style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: user.color,
                        color: "white",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold"
                        }}
                    >
                        {user.name[0]}
                    </div>

                    <span
                        style={{
                        fontSize: "12px",
                        background: "white",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                        }}
                    >
                        {user.name}
                    </span>

                    </div>
                );
                })}

        </div>
      </TransformComponent>
    </TransformWrapper>

    {/* MINI MAP */}
<div
  style={{
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 200,
    height: 130,
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  }}
>
  {notes.map((note) => (
    <div
      key={note.id}
      style={{
        position: "absolute",
        left: note.x / 15,
        top: note.y / 15,
        width: 6,
        height: 6,
        background: note.color || "#fff475",
        borderRadius: "2px"
      }}
    />
  ))}
</div>

  </div>
);
}

export default Room;