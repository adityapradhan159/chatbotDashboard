/* eslint-disable react/prop-types */
import "./chatBody.css";
import ChatList from "../chatList/ChatList";
import ChatContent from "../chatContent/ChatContent";
import UserProfile from "../userProfile/UserProfile";
import axios from "axios";

const ChatBody = ({setSelectedUserMessages,seletedUserMessages,sendMessage, AllChats,setAllChats,seletedUser,setSelectedUser,FetchAllMessages }) => {

  const getAllchats = () => {
    axios
      .post("https://knowing-cottony-metal.glitch.me/api/getAllchats")
      .then((response) => {
        setAllChats(response.data);
        // Handle the response from your server
        // console.log("Message saved:", response.data);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  };
  return (
    <div className="main__chatbody">
      <ChatList
      setSelectedUserMessages={setSelectedUserMessages}
      FetchAllMessages={FetchAllMessages}
        getAllchats={getAllchats}
        setSelectedUser={setSelectedUser}
        users={AllChats}
      />
      <ChatContent seletedUserMessages={seletedUserMessages} seletedUser={seletedUser} sendMessage={sendMessage} />
      <UserProfile />
    </div>
  );
};

export default ChatBody;
