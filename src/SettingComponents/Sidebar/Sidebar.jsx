import React from "react";
import "./sidebar.css";

const Sidebar = ({ addNode, onSave }) => {
  return (
    <div className="Sidebar">
      <button onClick={addNode}>Add Node</button>
      <button style={{ marginTop: "10px" }} onClick={onSave}>Save You Flow</button>
    </div>
  );
};

export default Sidebar;
