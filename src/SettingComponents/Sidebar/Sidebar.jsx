import React from "react";
import "./sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ addNode, onSave,addHttpsNode,addSchedularNode }) => {

  const navigate = useNavigate()

  return (
    <div className="Sidebar">

      <span onClick={()=>navigate(-1)}>Go Back</span>

      <button onClick={addNode}>Add Node</button>
      <button onClick={addHttpsNode} style={{marginTop:"20px"}}>Add https Node</button>
      <button onClick={addSchedularNode} style={{marginTop:"20px"}}>Add Scheduler Node</button>
      <button style={{ marginTop: "10px" }} onClick={onSave}>Save You Flow</button>
      
    </div>
  );
};

export default Sidebar;
