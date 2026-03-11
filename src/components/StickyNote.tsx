import Draggable from "react-draggable";
import { useRef, useState } from "react";

type StickyNoteProps = {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
  selected?: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
};

function StickyNote({ id, text, x, y, color, onMove, onDelete, onColorChange, selected, onSelect }: StickyNoteProps) {

  const nodeRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(text);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x, y }}
      onStop={(e, data) => {
        onMove(id, data.x, data.y);
      }}
    >
      <div
        ref={nodeRef}
         onMouseDown={(e) => {
            onSelect(id, e.shiftKey);
        }}
        style={{
          background: color || "#fff475",
          padding: "10px",
          borderRadius: "6px",
          width: "150px",
          border: selected ? "2px solid #6366f1" : "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          cursor: "grab",
          position: "absolute"
        }}
      >

        {/* Delete Button */}
        <button
          onClick={() => onDelete(id)}
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            cursor: "pointer"
          }}
        >
          ×
        </button>

        {/* Color Picker */}
        <div style={{ marginBottom: "6px", display: "flex", gap: "5px" }}>
          <span
            style={{ width: 12, height: 12, background: "#fff475", borderRadius: "50%", cursor: "pointer" }}
            onClick={() => onColorChange(id, "#fff475")}
          />
          <span
            style={{ width: 12, height: 12, background: "#93c5fd", borderRadius: "50%", cursor: "pointer" }}
            onClick={() => onColorChange(id, "#93c5fd")}
          />
          <span
            style={{ width: 12, height: 12, background: "#86efac", borderRadius: "50%", cursor: "pointer" }}
            onClick={() => onColorChange(id, "#86efac")}
          />
        </div>

        {/* Editable Text */}
        {editing ? (
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => setEditing(false)}
            autoFocus
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              resize: "none"
            }}
          />
        ) : (
          <div onDoubleClick={() => setEditing(true)}>
            {noteText}
          </div>
        )}

      </div>
    </Draggable>
  );
}

export default StickyNote;