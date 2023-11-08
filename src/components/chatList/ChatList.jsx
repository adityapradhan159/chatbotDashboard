/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "./chatList.css";
import ChatListItems from "./ChatListItems";
import axios from "axios";
import { useGetWhatsAppPhoneNumbersQuery } from "../../redux/Features/PhonNumberApi";

// eslint-disable-next-line no-unused-vars
const ChatList = ({
  setSelectedUserMessages,
  getAllchats,
  setSelectedUser,
  users,
  FetchAllMessages,
}) => {
  const [allChatUsers, setAllChatUsers] = useState([]);
  const { data: PhoneNumbers } = useGetWhatsAppPhoneNumbersQuery({
    whatsappBusinessAccountId: 154094001125067,
    accessToken:
      "EAALnGTlph40BOyoyZAuRn0HI1GGR8dYgIHzlgnqFrJ7bEufufzOqWlUFeHjHHKZCBDkzg2vawR7xgRhkQNhTOH0KZAPbZBVum3nhSzNu8ES9Wx6sMdco3sLXLjaCeR3df0ldncTaNXh3a3601S6d13Xd81oIGFubAcAk7rs1UlQzPChZBnSgmfyWbD874ZA4W8HIuFMobJucRMfUZBXW3kZD",
  });
  console.log("PhoneNumbers", PhoneNumbers);
  useEffect(() => {
    axios
      .get("https://knowing-cottony-metal.glitch.me/api/customer")
      .then((response) => {
        setAllChatUsers(response.data);
        console.log(response);
        // Handle the response from your server
        // console.log("Message saved:", response.data);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="main__chatlist">
      <div className="chatlist__heading">
        <h2>Chats</h2>
        <button onClick={() => getAllchats()}>getAllchats</button>
        <button className="btn-nobg">
          <i className="fa fa-ellipsis-h"></i>
        </button>
      </div>
      <div className="chatList__search">
        <div className="search_wrap">
          <input type="text" placeholder="Search Here" required />
          <button className="search-btn">
            <i className="fa fa-search"></i>
          </button>
        </div>
      </div>
      <div className="chatlist__items">
        {allChatUsers &&
          allChatUsers?.map((item, index) => {
            console.log(item, "item");
            return (
              <ChatListItems
                name={item.name}
                user={item}
                setSelectedUser={setSelectedUser}
                setSelectedUserMessages={setSelectedUserMessages}
                FetchAllMessages={FetchAllMessages}
                key={index}
                animationDelay={index + 1}
                active={"active"}
                isOnline={"active"}
                image="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTA78Na63ws7B7EAWYgTr9BxhX_Z8oLa1nvOA&usqp=CAU"
              />
            );
          })}
      </div>
    </div>
  );
};

export default ChatList;
