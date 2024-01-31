// import "./App.css";
// import Nav from "./components/nav/Nav";
// import ChatBody from "./components/chatBody/ChatBody";
// import { io } from "socket.io-client";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useNavigate,
// } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Provider, useSelector } from "react-redux";
// import store from "./redux/store";
// import LoginRegistration from "./components/LoginRegistration/LoginRegistration";
// import "reactflow/dist/style.css";
// import FlowSettings from "./Pages/FlowSettings/FlowSettings";
// import UserProfile from "./components/userProfile/UserProfile";

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import ImportCustomers from "./components/ImportCustomers/ImportCustomers";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAIPSlIghpPxdHJmT6zgHMCmc4dzZpbR5o",
//   authDomain: "chatbotdashboardv2.firebaseapp.com",
//   projectId: "chatbotdashboardv2",
//   storageBucket: "chatbotdashboardv2.appspot.com",
//   messagingSenderId: "1038335016642",
//   appId: "1:1038335016642:web:6d4148261512c374f8c55b",
//   measurementId: "G-P58B5DZY7F",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// function App() {
//   const [messages, setMessages] = useState([]);
//   const [AllChats, setAllChats] = useState([]);
//   // var socket = io("https://tudoorg.glitch.me");
//   const [seletedUser, setSelectedUser] = useState(null);
//   const [seletedUserMessages, setSelectedUserMessages] = useState(null);

//   const { navTab } = useSelector((state) => state.StoredData);

//   const sendMessage = () => {
//     // socket.emit("sendmessage", { chatId, messageContent });
//   };
//   const FetchAllMessages = () => {
//     // socket.emit("fetchAllMessages", { chatId });
//   };
//   console.log(seletedUserMessages, "selectedUserMessages");
//   useEffect(() => {
//     const handleMessage = (data) => {
//       if (data.number == seletedUser.number) {
//         console.log(data, "onMessage");
//         setSelectedUserMessages((prevMessages) => [...prevMessages, data]);
//       }
//     };

//     // // Add the event listener
//     // socket.on("message", handleMessage);
//     // socket.on("adminmessage", handleMessage);

//     // // Clean up the event listener when the component unmounts
//     // return () => {
//     //   socket.off("message", handleMessage);
//     //   socket.off("adminmessage", handleMessage);
//     // };
//   }, []);

//   // Listen for the "qrCode" event from the server
//   // socket.on("qrCode", (data) => {
//   //   if (data) {
//   //     setQrCode(data);
//   //   }
//   // socket.on("chats", (data) => {
//   //   console.log(data, "chats");
//   //   setAllChats(data);
//   //   // setAllChats((prevMessages) => [...prevMessages, data]);
//   // });

//   // Listen for the "message" event from the server
//   // socket.on("message", (data) => {
//   //   setMessages((prevMessages) => [...prevMessages, data]);
//   // });
//   // socket.on("allFetchedMessages", (data) => {
//   //   console.log(data, "allFetchedMessages");
//   //   setSelectedUserMessages(data)
//   // setMessages((prevMessages) => [...prevMessages, data]);
//   // });

//   const [showModal, setShowModal] = useState(false);
//   const navigate = useNavigate();

//   const handleFlowModal = () => {
//     setShowModal(!showModal);
//   };

//   const handleSaveFlow = () => {
//     setShowModal(!showModal);
//   };

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginRegistration />} />
//         <Route path="/settings" element={<FlowSettings />} />
//         <Route path="/importCustomers" element={<ImportCustomers />} />
//         <Route
//           path="/dashboard"
//           element={
//             <div className="__main">
//               {messages &&
//                 messages.map((itm, index) => {
//                   return <div key={index}>{itm.body}</div>;
//                 })}
//               {/* <Nav /> */}
//               <UserProfile />

//               <div className="sideTabBody">
//                 {navTab == 0 ? (
//                   <ChatBody
//                     seletedUserMessages={seletedUserMessages}
//                     setSelectedUserMessages={setSelectedUserMessages}
//                     AllChats={AllChats}
//                     setAllChats={setAllChats}
//                     sendMessage={sendMessage}
//                     seletedUser={seletedUser}
//                     setSelectedUser={setSelectedUser}
//                     FetchAllMessages={FetchAllMessages}
//                   />
//                 ) : navTab == 1 ? (
//                   <></>
//                 ) : navTab == 2 ? (
//                   <div className="automationDiv">
//                     <button onClick={handleFlowModal}>Create a flow</button>

//                     {showModal == true && (
//                       <div className="flowModal">
//                         <label htmlFor="">Please enter flow name.</label>
//                         <input type="text" />
//                         <button onClick={handleSaveFlow}>Save</button>
//                       </div>
//                     )}

//                     <div
//                       className="flowList"
//                       onClick={() => navigate("/settings")}
//                     >
//                       <div className="flowStatus"></div>
//                       <div className="flowName">Flow 1</div>
//                     </div>
//                   </div>
//                 ) : (
//                   <></>
//                 )}
//               </div>
//             </div>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import "./App.css";
import Nav from "./components/nav/Nav";
import ChatBody from "./components/chatBody/ChatBody";
import { io } from "socket.io-client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider, useSelector } from "react-redux";
import store from "./redux/store";
import LoginRegistration from "./components/LoginRegistration/LoginRegistration";
import "reactflow/dist/style.css";
import FlowSettings from "./Pages/FlowSettings/FlowSettings";
import UserProfile from "./components/userProfile/UserProfile";
import Dashboard from "./Pages/dashboard/Dashboard";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import ImportCustomers from "./components/ImportCustomers/ImportCustomers";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIPSlIghpPxdHJmT6zgHMCmc4dzZpbR5o",
  authDomain: "chatbotdashboardv2.firebaseapp.com",
  projectId: "chatbotdashboardv2",
  storageBucket: "chatbotdashboardv2.appspot.com",
  messagingSenderId: "1038335016642",
  appId: "1:1038335016642:web:6d4148261512c374f8c55b",
  measurementId: "G-P58B5DZY7F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function App() {
  // const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [AllChats, setAllChats] = useState([]);
  // var socket = io("https://tudoorg.glitch.me");
  const [seletedUser, setSelectedUser] = useState(null);
  const [seletedUserMessages, setSelectedUserMessages] = useState(null);

  const { navTab } = useSelector((state) => state.StoredData);

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

    // // Add the event listener
    // socket.on("message", handleMessage);
    // socket.on("adminmessage", handleMessage);

    // // Clean up the event listener when the component unmounts
    // return () => {
    //   socket.off("message", handleMessage);
    //   socket.off("adminmessage", handleMessage);
    // };
  }, []);

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

  const [showModal, setShowModal] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegistration />} />
        <Route path="/settings" element={<FlowSettings />} />
        <Route path="/importCustomers" element={<ImportCustomers />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              messages={messages}
              navTab={navTab}
              seletedUserMessages={seletedUserMessages}
              setSelectedUserMessages={setSelectedUserMessages}
              AllChats={AllChats}
              setAllChats={setAllChats}
              sendMessage={sendMessage}
              seletedUser={seletedUser}
              setSelectedUser={setSelectedUser}
              FetchAllMessages={FetchAllMessages}
              setShowModal={setShowModal}
              showModal={showModal}
            />
          }
          // <div className="__main">
          //   {messages &&
          //     messages.map((itm, index) => {
          //       return <div key={index}>{itm.body}</div>;
          //     })}
          //   {/* <Nav /> */}
          //   <UserProfile />

          //   <div className="sideTabBody">
          //     {navTab == 0 ? (
          //       <ChatBody
          //         seletedUserMessages={seletedUserMessages}
          //         setSelectedUserMessages={setSelectedUserMessages}
          //         AllChats={AllChats}
          //         setAllChats={setAllChats}
          //         sendMessage={sendMessage}
          //         seletedUser={seletedUser}
          //         setSelectedUser={setSelectedUser}
          //         FetchAllMessages={FetchAllMessages}
          //       />
          //     ) : navTab == 1 ? (
          //       <></>
          //     ) : navTab == 2 ? (
          //       <div className="automationDiv">
          //         <button onClick={handleFlowModal}>Create a flow</button>

          //         {showModal == true && (
          //           <div className="flowModal">
          //             <label htmlFor="">Please enter flow name.</label>
          //             <input type="text" />
          //             <button onClick={handleSaveFlow}>Save</button>
          //           </div>
          //         )}

          //         <div
          //           className="flowList"
          //           onClick={() => navigate("/settings")}
          //         >
          //           <div className="flowStatus"></div>
          //           <div className="flowName">Flow 1</div>
          //         </div>
          //       </div>
          //     ) : (
          //       <></>
          //     )}
          //   </div>
          // </div>
        />
      </Routes>
    </Router>
  );
}

export default App;
