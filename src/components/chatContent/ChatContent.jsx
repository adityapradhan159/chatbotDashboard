/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import "./chatContent.css";
import Avatar from "../chatList/Avatar";
import ChatItem from "./ChatItem";
import { AiFillFolderAdd } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import axios from "axios";
import { usePostChatMutation } from "../../redux/Features/MessageApi";
import { useSelector } from "react-redux";
const ChatContent = ({ seletedUser, seletedUserMessages }) => {
  const timestamp = new Date(); // Current timestamp
  const [postChat] = usePostChatMutation();
  const user = useSelector((state) => state.SelectedUser);
  const userNumber = user?.number;
  console.log(user, "user");

  const HandleSendMessage = (message) => {
    axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v17.0/" +
        156640407536431 +
        "/messages?access_token=" +
        "EAAEieJXDBVgBOxnHzNBqodFi4hKZCC8AZCFfhsQq1ebrlyTbuoY9WVOwRZBZCZCCQZCiJnZAyxWGckZAvt60WWZAQAoatZBuZAVXLeVKQfVLKPy0LovuLhI3LTgz1udvBvE5vIfwqNNcN2AcAoBsqswXQx5KoYIJ1tMbLm7eZAIpRZALWqD8fw4GlrWZAR7NDssCoXwnyHUZBAjFdKwXpeuN8f58ik5SS3Vy4mZB7ZA82o37f",
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
          chatId: userNumber,
          message: message,
          timestamp: timestamp.toISOString(),
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const messagesEndRef = useRef(null);

  // if (seletedUserMessages) {
  //   const scrollToBottom = () => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   };
  //   scrollToBottom();
  // }
  console.log("seletedUserMessages", seletedUserMessages);
  console.log("seletedUser", seletedUser);
  const [msg, setMsg] = useState("");

  const onStateChange = (e) => {
    setMsg(e.target.value);
  };

  return (
    <div className="main__chatcontent">
      <div className="content__header">
        <div className="blocks">
          <div className="current-chatting-user">
            <Avatar
              // isOnline="active"
              image="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTA78Na63ws7B7EAWYgTr9BxhX_Z8oLa1nvOA&usqp=CAU"
            />
            <p>{user.name}</p>
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
      <div className="content__body"  style={{height:"100vh"}}>
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
