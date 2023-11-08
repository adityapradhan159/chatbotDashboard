/* eslint-disable react/prop-types */
import "./chatBody.css";
import ChatList from "../chatList/ChatList";
import ChatContent from "../chatContent/ChatContent";
import UserProfile from "../userProfile/UserProfile";

const ChatBody = ({setSelectedUserMessages,seletedUserMessages,sendMessage, AllChats,setAllChats,seletedUser,setSelectedUser,FetchAllMessages }) => {

 
  return (
    <div className="main__chatbody">
      <ChatList
      setSelectedUserMessages={setSelectedUserMessages}
      FetchAllMessages={FetchAllMessages}
        setSelectedUser={setSelectedUser}
        users={AllChats}
      />
      <ChatContent seletedUserMessages={seletedUserMessages} seletedUser={seletedUser} sendMessage={sendMessage} />
      <UserProfile />
    </div>
  );
};

export default ChatBody;
