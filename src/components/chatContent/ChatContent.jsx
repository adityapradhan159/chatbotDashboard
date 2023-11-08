/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import "./chatContent.css";
import Avatar from "../chatList/Avatar";
import ChatItem from "./ChatItem";
import { AiFillFolderAdd } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import axios from "axios";
import { usePostChatMutation } from "../../redux/Features/MessageApi";
import { useSelector } from "react-redux"
const ChatContent = ({  seletedUser, seletedUserMessages }) => {
  const timestamp = new Date(); // Current timestamp
  const [postChat] = usePostChatMutation();
  const user = useSelector((state) => state.SelectedUser);
  const userNumber=user?.number
console.log(user,"user")
  // console.log("seletedUser", seletedUser?.lastMessage.id.id,seletedUser.lastMessage);
  // const [chat, setChat] = useState([
  //   {
  //     key: 1,
  //     image:
  //       "https://pbs.twimg.com/profile_images/1116431270697766912/-NfnQHvh_400x400.jpg",
  //     type: "",
  //     msg: seletedUser?.lastMessage,
  //   },
  // ]);
  const HandleSendMessage = (message) => {
    axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v17.0/" +
        183237621528783 +
        "/messages?access_token=" +
        "EAALnGTlph40BOyoyZAuRn0HI1GGR8dYgIHzlgnqFrJ7bEufufzOqWlUFeHjHHKZCBDkzg2vawR7xgRhkQNhTOH0KZAPbZBVum3nhSzNu8ES9Wx6sMdco3sLXLjaCeR3df0ldncTaNXh3a3601S6d13Xd81oIGFubAcAk7rs1UlQzPChZBnSgmfyWbD874ZA4W8HIuFMobJucRMfUZBXW3kZD",
      data: {
        messaging_product: "whatsapp",
        to: userNumber,
        type: "text",
        text: {
          body: message,
        },
      },
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        console.log(response);
        postChat({
          name: "admin",
          number: userNumber,
          chatId:userNumber,
          message: message,
          timestamp: timestamp.toISOString(),
        }); 
        // Convert the Date object to an ISO string})
        // axios
        //   .post("https://knowing-cottony-metal.glitch.me/api/chat", {
        //     name: "admin",
        //     number: "01786686408",
        //     chatId: seletedUser?.number,
        //     message:message,
        //     timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
        //   })
        //   .then((response) => {
        //     // Handle the response from your server
        //     // console.log("Message saved:", response.data);
        //   })
        //   .catch((error) => {
        //     // Handle any errors
        //     console.error("Error:", error);
        //   });
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  };
  console.log("seletedUserMessages", seletedUserMessages);
  console.log("seletedUser", seletedUser);
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);

  // const scrollToBottom = () => {
  //   messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   window.addEventListener("keydown", (e) => {
  //     if (e.keyCode === 13) {
  //       if (msg !== "") {
  //         const newChatItem = {
  //           key: 1,
  //           type: "",
  //           msg: msg,
  //           image:
  //             "https://pbs.twimg.com/profile_images/1116431270697766912/-NfnQHvh_400x400.jpg",
  //         };
  //         setChat([...chat, newChatItem]);
  //         scrollToBottom();
  //         setMsg("");
  //       }
  //     }
  //   });
  //   scrollToBottom();
  // }, [msg, chat]);

  const onStateChange = (e) => {
    setMsg(e.target.value);
  };

  return (
    <div className="main__chatcontent">
      <div className="content__header">
        <div className="blocks">
          <div className="current-chatting-user">
            <Avatar
              isOnline="active"
              image="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTA78Na63ws7B7EAWYgTr9BxhX_Z8oLa1nvOA&usqp=CAU"
            />
            <p>Tim Hover</p>
          </div>
        </div>

        <div className="blocks">
          <div className="settings">
            <button className="btn-nobg">
              <i className="fa fa-cog"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="content__body">
        {seletedUserMessages?.map((itm, index) => {
          return (
            <div className="chat__items" key={index}>
              <ChatItem
                animationDelay={0 + 2}
                key={index}
                user={"me"}
                msg={itm}
                image="https://pbs.twimg.com/profile_images/1116431270697766912/-NfnQHvh_400x400.jpg"
              />{" "}
              <div ref={messagesEndRef} />
            </div>
          );
        })}
      </div>
      <div className="content__footer">
        <div className="sendNewMessage">
          <button className="addFiles">
            <AiFillFolderAdd />
          </button>
          <input
            type="text"
            placeholder="Type a message here"
            onChange={onStateChange}
            value={msg}
          />
          <button
            className="btnSendMsg"
            id="sendMsgBtn"
            // onClick={() => sendMessage(seletedUser?.id._serialized, msg)}
            onClick={() => HandleSendMessage(msg)}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContent;
