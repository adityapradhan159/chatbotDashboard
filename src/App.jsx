import "./App.css";
import Nav from "./components/nav/Nav";
import ChatBody from "./components/chatBody/ChatBody";
import { io } from "socket.io-client";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import LoginRegistration from "./components/LoginRegistration/LoginRegistration";
function App() {
  const [messages, setMessages] = useState([]);
  const [AllChats, setAllChats] = useState([]);
  var socket = io("https://knowing-cottony-metal.glitch.me");
  const [seletedUser, setSelectedUser] = useState(null);
  const [seletedUserMessages, setSelectedUserMessages] = useState(null);

  const sendMessage = () => {
    // socket.emit("sendmessage", { chatId, messageContent });
  };
  const FetchAllMessages = () => {
    // socket.emit("fetchAllMessages", { chatId });
  };
  console.log(seletedUserMessages, "selectedUserMessages");
  useEffect(() => {
    const handleMessage = (data) => {
      if (data.number == seletedUser.number) {
        console.log(data, "onMessage");
        setSelectedUserMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    // Add the event listener
    socket.on("message", handleMessage);
    socket.on("adminmessage", handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("message", handleMessage);
      socket.off("adminmessage", handleMessage);
    };
  }, [socket]);

  // Listen for the "qrCode" event from the server
  // socket.on("qrCode", (data) => {
  //   if (data) {
  //     setQrCode(data);
  //   }
  // socket.on("chats", (data) => {
  //   console.log(data, "chats");
  //   setAllChats(data);
  //   // setAllChats((prevMessages) => [...prevMessages, data]);
  // });

  // Listen for the "message" event from the server
  // socket.on("message", (data) => {
  //   setMessages((prevMessages) => [...prevMessages, data]);
  // });
  // socket.on("allFetchedMessages", (data) => {
  //   console.log(data, "allFetchedMessages");
  //   setSelectedUserMessages(data)
  // setMessages((prevMessages) => [...prevMessages, data]);
  // });

  console.log("hello world :o");

  return (

    <Router>
      <Routes>
        <Route path="/" element={<LoginRegistration/>}/>
        <Route path="/dashboard" element={<div className="__main">
        {messages &&
          messages.map((itm, index) => {
            return <div key={index}>{itm.body}</div>;
          })}
        <Nav />
        <ChatBody
          seletedUserMessages={seletedUserMessages}
          setSelectedUserMessages={setSelectedUserMessages}
          AllChats={AllChats}
          setAllChats={setAllChats}
          sendMessage={sendMessage}
          seletedUser={seletedUser}
          setSelectedUser={setSelectedUser}
          FetchAllMessages={FetchAllMessages}
        />
      </div>}/>
      </Routes>
    </Router>
    
      
    
  );
}

export default App;
