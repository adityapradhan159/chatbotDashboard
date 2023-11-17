import React from "react";
import "./sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ addNode, onSave }) => {

  const navigate = useNavigate()

  return (
    <div className="Sidebar">

      <span onClick={()=>navigate(-1)}>Go Back</span>

      <button onClick={addNode}>Add Node</button>
      <button style={{ marginTop: "10px" }} onClick={onSave}>Save You Flow</button>
    </div>
  );
};

export default Sidebar;
