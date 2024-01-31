
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
import { useSelector } from "react-redux";



const nodeTypes = { textUpdater: NodeType };

const FlowSettings = () => {
  const { apiType } = useSelector((state) => state.StoredData);

  const [initNode, setInitNode] = useState([]);
  const [initEdge, setInitEdge] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNode);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdge);

  const [nodesFt, setNodesFt, onNodesChangeFt] = useNodesState(nodes);
  const [edgesFt, setEdgesFt, onEdgesChangeFt] = useEdgesState(edges);

  // console.log("api Type", apiType)

  const flowKey = "example-flow";
  const [rfInstance, setRfInstance] = useState(null);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.log(flow);
      localStorage.setItem(flowKey, JSON.stringify(flow));

      const whatsAppBusinessAccountId = localStorage.getItem(
        "whatsAppBusinessAccountId"
      );

      // Filter nodes with flowId=flowId-ay
      const filteredNodes = flow.nodes.filter(
        (node) => node.data.flowId === localStorage.getItem("flowId")
      );

      // Filter edges with flowId=flowId-ay
      const filteredEdges = flow.edges.filter(
        (edge) => edge.data.flowId === localStorage.getItem("flowId")
      );

      const filteredData = {
        nodes: filteredNodes,
        edges: filteredEdges,
        viewport: flow.viewport, // Keep the original viewport
      };
      console.log(flow, "This is flow");
      console.log(filteredData, "This is flow2");

      axios
        .put(
          `https://tudoorg.glitch.me/api/chatFlow?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}&flowId=${localStorage.getItem(
            "flowId"
          )}`,
          {
            ...flow,
            whatsAppBusinessAccountId: whatsAppBusinessAccountId,
          }
        )
        .then((res) => {
          console.log(res);
          alert("Flow Saved..");
        })
        .catch((err) => {
          console.log(err);
        });
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
          data: {
            name: `{Node}`,
            flowId: localStorage.getItem("flowId"),
          },
        },
      ];
    });
  }, []);

  const addHttpsNode = useCallback(() => {
    yPos.current += 100;
    setNodes((els) => {
      console.log(els);
      return [
        ...els,
        {
          id: Math.random().toString(),
          type: "textUpdater",
          position: { x: 100, y: yPos.current },
          data: {
            name: "Webhook Node",
            apiType: "get",
            customFields: [],
            fetchedData: ``,
            flowId: localStorage.getItem("flowId"),
          },
        },
      ];
    });
  }, []);

  const addUserInputNode = useCallback(() => {
    yPos.current += 100;
    setNodes((els) => {
      console.log(els);
      return [
        ...els,
        {
          id: Math.random().toString(),
          type: "textUpdater",
          position: { x: 100, y: yPos.current },
          data: {
            name: "User Input Node",
            flowId: localStorage.getItem("flowId"),
          },
        },
      ];
    });
  }, []);

  useEffect(() => {
    const whatsAppBusinessAccountId = localStorage.getItem(
      "whatsAppBusinessAccountId"
    );

    axios
      .get(
        `https://tudoorg.glitch.me/api/chatFlow?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
      )
      .then((res) => {
        console.log("Response", res);

        const filteredNode =
          res.data[0]?.nodes &&
          res.data[0]?.nodes.filter((node) => {
            return node?.data?.flowId == localStorage.getItem("flowId");
          });

        const filteredEdge =
          res.data[0]?.edges &&
          res.data[0]?.edges.filter((edge) => {
            return edge?.data?.flowId == localStorage.getItem("flowId");
          });

        // console.log(filteredNode, filteredEdge);
        // console.log(res.data[0].nodes, res.data[0].edges);

        setNodes(res.data[0].nodes);
        setEdges(res.data[0].edges);

        setNodesFt(filteredNode);
        setEdgesFt(filteredEdge);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges]
  // );

  const onConnect = useCallback(
    (params) => {
      // Create a new edge with custom data
      const newEdge = {
        id: `edge-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        data: { flowId: localStorage.getItem("flowId") }, // Add custom data to the edge
      };

      // Update the edges state with the new edge
      setEdges((edges) => addEdge(newEdge, edges));
    },
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="Dashboard">
        <Sidebar
          addNode={addNode}
          onSave={onSave}
          addHttpsNode={addHttpsNode}
          addUserInputNode={addUserInputNode}
        />
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
  );
}

export default FlowSettings