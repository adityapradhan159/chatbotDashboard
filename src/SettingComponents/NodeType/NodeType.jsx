/* eslint-disable react/jsx-key */
import React, { useCallback, useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import "./nodeType.css";
import { IoCloseCircle } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { MdEditSquare } from "react-icons/md";
import store from "../../redux/store";
import axios from "axios";
import Modal from "../../components/Modal/Modal";

const NodeType = ({ id, isConnectable, data }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: "text", content: "", nodeId: id },
  ]);
  const [externalLink,setExternalLink]=useState('')
  const [listItems, setListItems] = useState([
    { id: 1, type: "text", content: "", nodeId: id },
  ]);
  const [buttonItems, setButtonItems] = useState([
    { id: 1, type: "text", content: "", nodeId: id },
  ]);
  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (data && data.text) {
      const storedMessages =
        data &&
        data?.text.map((message) =>
          message.id === id ? { ...message, content: message.content } : message
        );
      setMessages(storedMessages);
      setListItems(storedMessages);
      setButtonItems(storedMessages);
    }
  }, []);

  // console.log("Id",id)

  const handleChange = (messageId, evt) => {
    const updatedMessages = messages.map((message) =>
      message.id === messageId
        ? { ...message, content: evt.target.value }
        : message
    );
    setButtonItems(updatedMessages);
    setListItems(updatedMessages);
    setMessages(updatedMessages);
    console.log(id);
    console.log("Data", data);

    data.text = updatedMessages;
  };
const HandleExternalLink=(evt)=>{
  setExternalLink(evt.target.value);
}
  const addNewButton = () => {
    setShowActionsPopup(!showActionsPopup);

    // const newButton = {
    //   id: messages.length + 1,
    //   type: "button",
    //   content: "",
    //   nodeId:id,
    //   sourceHandle:`handle${messages.length + 1}`
    // };
    // setMessages([...messages, newButton]);
  };

  const handleDeleteButton = (id) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };
    const newMessages = data.text.filter((el) => {
      return el.id !== id;
    });
    data.text = newMessages;
    console.log("New Messages", newMessages);
    setMessages(newMessages);
    setListItems(newMessages);
    setButtonItems(newMessages);
  };

  const handleAddList = () => {
    const newButton = {
      id: messages.length + 1,
      type: "list",
      content: "",
      nodeId: id,
      sourceHandle: `handle${messages.length + 1}`,
    };

    setListItems([...messages, newButton]);
    setMessages([...messages, newButton]);
  };

  const handleAddButton = () => {
    const newButton = {
      id: messages.length + 1,
      type: "button",
      content: "",
      nodeId: id,
      sourceHandle: `handle${messages.length + 1}`,
    };

    setButtonItems([...messages, newButton]);
    setMessages([...messages, newButton]);
  };



  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === "text" ? (
              <div style={{ marginBottom: "10px" }}>
                {data.name !== "Webhook Node" ? (
                  <>
                    <label htmlFor={`message${message.id}`}>Description:</label>
                    <textarea
                      placeholder="Enter Your Api"
                      rows={3}
                      cols={25}
                      style={{
                        outline: "none",
                        padding: 5,
                        outlineColor: "gray",
                        border: "1px solid #e6e6e6",
                        borderRadius: 5,
                      }}
                      id={`message${message.id}`}
                      name={`message${message.id}`}
                      onChange={(evt) => handleChange(message.id, evt)}
                      value={message.content}
                      className="nodrag"
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor={`message${message.id}`}>
                      External Link:
                    </label>
                    <textarea
                      placeholder="Enter Your Api"
                      rows={3}
                      cols={25}
                      style={{
                        outline: "none",
                        padding: 5,
                        outlineColor: "gray",
                        border: "1px solid #e6e6e6",
                        borderRadius: 5,
                      }}
                      id={`message${message.id}`}
                      name={`message${message.id}`}
                      onChange={(evt) => HandleExternalLink(evt)}
                      value={message.content}
                      className="nodrag"
                    />
                  </>
                )}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  disabled
                  id={`button${message.id}`}
                  name={`button${message.id}`}
                  onChange={(evt) =>
                    handleChange(message.id, evt, message.type)
                  }
                  value={message.content}
                  className="nodrag list-btn"
                />
                <Handle
                  style={{ top: "auto" }}
                  type="source"
                  position={Position.Right}
                  id={`handle${message.id}`}
                  isConnectable={isConnectable}
                />
              </div>
            )}
          </div>
        ))}

        {data.name == "Webhook Node" && (
          <div>
            <Modal
              api={externalLink}
              open={open}
              setExternalLink={setExternalLink}
              handleClose={handleClose}
              handleClickOpen={handleClickOpen}
            />
            <button
              onClick={handleClickOpen}
              style={{
                textAlign: "center",
                width: "100%",
                outline: "none",
                background: "#4FCCC2",
                color: "white",
                padding: "10px 20px 10px 20px",
                border: "none",
                borderRadius: 5,
                display: "block",
                marginBottom: 5,
              }}
            >
              Parse Response
            </button>

            {/* <button
              style={{
                textAlign: "center",
                width: "100%",
                outline: "none",
                background: "#4FCCC2",
                color: "white",
                padding: "10px 20px 10px 20px",
                border: "none",
                borderRadius: 5,
                marginBottom: 5,
              }}
              onClick={HandleResponse}
            >
              Get Response
            </button> */}
          </div>
        )}
        <button
          style={{
            textAlign: "center",
            width: "100%",
            outline: "none",
            background: "#4FCCC2",
            color: "white",
            padding: "10px 20px 10px 20px",
            border: "none",
            borderRadius: 5,
          }}
          onClick={addNewButton}
        >
          <FaPlus />

          {/* Add Select Options */}
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />

      {showActionsPopup == true && (
        <div className="actions-popup">
          <h4>Action Items</h4>

          <div className="add-list-section">
            <h5>List</h5>

            {messages.map(
              (message) =>
                message.type !== "text" &&
                message.type !== "button" && (
                  <div className="list-container">
                    <input
                      id={`button${message.id}`}
                      name={`button${message.id}`}
                      onChange={(evt) =>
                        handleChange(message.id, evt, message.type)
                      }
                      value={message.content}
                      className="nodrag list-input"
                      placeholder="Item name..."
                    />
                    <div
                      className="delete-icon"
                      onClick={() => handleDeleteButton(message.id)}
                    >
                      <MdDeleteForever />
                    </div>
                  </div>
                )
            )}

            <button onClick={handleAddList}>
              Add Item
              <FaPlus />
            </button>
          </div>

          {
            // listItems.length == 1 &&
            <div className="add-list-section">
              <h5>Buttons (upto 3)</h5>

              {messages.map(
                (message) =>
                  message.type !== "text" &&
                  message.type !== "list" && (
                    <div className="list-container">
                      <input
                        id={`button${message.id}`}
                        name={`button${message.id}`}
                        onChange={(evt) =>
                          handleChange(message.id, evt, message.type)
                        }
                        value={message.content}
                        className="nodrag list-input"
                        placeholder="Item name..."
                      />
                      <div
                        className="delete-icon"
                        onClick={() => handleDeleteButton(message.id)}
                      >
                        <MdDeleteForever />
                      </div>
                    </div>
                  )
              )}

              <button
                onClick={handleAddButton}
                disabled={buttonItems.length >= 4 ? true : false}
              >
                Add Button
                <FaPlus />
              </button>
            </div>
          }

          {/* <div className="save-changes-btns">
            <button className="apply-btn" onClick={handleSaveChanges}>Apply</button>
            <button className="cancel-btn">Cancel</button>
          </div> */}
        </div>
      )}

      {/* Single Handle for the entire component */}
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        isConnectable={isConnectable}
      /> */}
    </div>
  );
};

export default NodeType;
