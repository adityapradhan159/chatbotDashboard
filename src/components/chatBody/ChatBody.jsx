/* eslint-disable react/prop-types */
import "./chatBody.css";
import ChatList from "../chatList/ChatList";
import ChatContent from "../chatContent/ChatContent";
import UserProfile from "../userProfile/UserProfile";
import { useSelector } from "react-redux";
import Broadcast from "../Broadcast/Broadcast";

const ChatBody = ({setSelectedUserMessages,seletedUserMessages,sendMessage, AllChats,setAllChats,seletedUser,setSelectedUser,FetchAllMessages }) => {


  const {showComponent} = useSelector((state) => state.SelectedComponent)

  console.log(showComponent,"showComponent")
 
  return (
    <div className="main__chatbody">
      <ChatList
        setSelectedUserMessages={setSelectedUserMessages}
        FetchAllMessages={FetchAllMessages}
        setSelectedUser={setSelectedUser}
        users={AllChats}
      />

      {
        showComponent == "chatContent" ? 
        <ChatContent seletedUserMessages={seletedUserMessages} seletedUser={seletedUser} sendMessage={sendMessage} />

        :
        showComponent == "broadcast" ?

        <Broadcast/>

        :
        <></>
      }
      
      
      <UserProfile />
    </div>
  );
};

export default ChatBody;
