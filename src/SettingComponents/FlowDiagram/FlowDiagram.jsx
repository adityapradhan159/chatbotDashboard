/* eslint-disable react/prop-types */
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";

const FlowDiagram = ({
  nodes,
  edges,
  setRfInstance,
  onNodesChange,
  onConnect,
  onEdgesChange,
  nodeTypes,
  setNodes
}) => {
  // const nodeTypes = { textUpdater: NodeType };

  return (
    <div className="flowDiagram">
      {/* <ReactFlow
          nodes={els}
          // elements={els} 
          onConnect={addEdge}  
          onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}  
        > */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default FlowDiagram;
