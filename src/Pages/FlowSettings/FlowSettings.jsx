
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./flowSettings.css";
import Sidebar from "../../SettingComponents/Sidebar/Sidebar";
import FlowDiagram from "../../SettingComponents/FlowDiagram/FlowDiagram";
import {
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
} from "reactflow";
import NodeType from "../../SettingComponents/NodeType/NodeType";
import axios from "axios";



const nodeTypes = { textUpdater: NodeType };

const FlowSettings = () => {

    




  const flowKey = "example-flow";
  const [rfInstance, setRfInstance] = useState(null);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.log(flow);
      localStorage.setItem(flowKey, JSON.stringify(flow));

      const whatsAppBusinessAccountId = localStorage.getItem("whatsAppBusinessAccountId")

      axios.put(`https://tudoorg.glitch.me/api/chatFlow?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`,{...flow,"whatsAppBusinessAccountId":whatsAppBusinessAccountId})
      .then((res) => {
        console.log(res)
        alert("Flow Saved..")
      })
      .catch((err) => {
        console.log(err)
      })

    }
  }, [rfInstance]);
 
  const yPos = useRef(0);

  const addNode = useCallback(() => {
    yPos.current += 100;
    setNodes((els) => {
      console.log(els);
      return [
        ...els,
        {
          id: Math.random().toString(),
          type: "textUpdater",
          position: { x: 100, y: yPos.current },
          data: {},
        },
      ];
    });
  }, []);


  const initialNodes = [
  ];
  const initialEdges = [];

  const [initNode,setInitNode] = useState([])
  const [initEdge,setInitEdge] = useState([])

  
  const [nodes, setNodes, onNodesChange] = useNodesState(initNode);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdge);

  useEffect(() => {

    const whatsAppBusinessAccountId = localStorage.getItem("whatsAppBusinessAccountId")

    axios.get(`https://tudoorg.glitch.me/api/chatFlow?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`)
    .then((res) => {
        console.log("Response",res)
        setNodes(res.data[0].nodes)
        setEdges(res.data[0].edges)
    })
    .catch((err) => {
        console.log(err)
    })
  }, [])
  

   // const [nodes, setNodes] = useState(initialNodes);
  // const [edges, setEdges] = useState([]);


  // const onNodesChange = useCallback(
  //   (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   [setNodes]
  // );

  // const onEdgesChange = useCallback(
  //   (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  //   [setEdges]
  // );


 

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="Dashboard">
        <Sidebar addNode={addNode} onSave={onSave} onc/>
        <FlowDiagram
          nodeTypes={nodeTypes}
          setNodes={setNodes}
          setRfInstance={setRfInstance}
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        />
        {/* <FlowDiagram addEdge={addEdge} els={els} onNodesChange={onNodesChange}/> */}
      </div>
    </ReactFlowProvider>
  )
}

export default FlowSettings