/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "./chatList.css";
import ChatListItems from "./ChatListItems";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setShowComponent } from "../../redux/Features/SelectedComponent";
import { setUsers } from "../../redux/Features/Data";

// eslint-disable-next-line no-unused-vars
const ChatList = ({
  setSelectedUserMessages,
  setSelectedUser,
  FetchAllMessages,
}) => {

  const dispatch = useDispatch()
  const [allChatUsers, setAllChatUsers] = useState([]);
  useEffect(() => {
    const whatsAppBusinessAccountId = localStorage.getItem("whatsAppBusinessAccountId")
    axios
      .get(`https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`)
      .then((response) => {
        setAllChatUsers(response.data);
        console.log("UsersData",response);
        dispatch(setUsers(response.data))
        // Handle the response from your server
        // console.log("Message saved:", response.data);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  }, []);


  const handleBroadcast = () => {

    dispatch(setShowComponent("broadcast"))

    // const customers = [
    //   {
    //     name:"Aditya Pradhan",
    //     number:"919769740159"
    //   },
    //   // {
    //   //   name:"Mynul",
    //   //   number:"8801786686408"
    //   // }
    // ]

    // const message = "Hello How are you!!!"

    // customers && customers.map((user) => {

    //   axios({
    //     method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    //     url:
    //       "https://graph.facebook.com/v17.0/" +
    //       156640407536431 +
    //       "/messages?access_token=" +
    //       "EAAEieJXDBVgBOxnHzNBqodFi4hKZCC8AZCFfhsQq1ebrlyTbuoY9WVOwRZBZCZCCQZCiJnZAyxWGckZAvt60WWZAQAoatZBuZAVXLeVKQfVLKPy0LovuLhI3LTgz1udvBvE5vIfwqNNcN2AcAoBsqswXQx5KoYIJ1tMbLm7eZAIpRZALWqD8fw4GlrWZAR7NDssCoXwnyHUZBAjFdKwXpeuN8f58ik5SS3Vy4mZB7ZA82o37f",
    //     data: {
    //       messaging_product: "whatsapp",
    //       to: user.number,
    //       type: "text",
    //       text: {
    //         body: message,
    //       },
    //     },
    //     headers: { "Content-Type": "application/json" },
    //   })
    //     .then((response) => {
    //       console.log(response);
    //       postChat({
    //         name: "admin",
    //         number: user.number,
    //         chatId: user.number,
    //         message: message,
    //         timestamp: timestamp.toISOString(),
    //       });
    //     })
    //     .catch((error) => {
    //       console.error("Error:", error);
    //     });

    // })

    
  }

  return (
    <div className="main__chatlist">
      <div className="chatlist__heading">
        <h2>Chats</h2>
        <button className="btn-nobg">
          <i className="fa fa-ellipsis-h"></i>
        </button>
      </div>

      <div className="broadcast-btn">
        <button onClick={handleBroadcast}>
          Broadcast
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
                // active={"active"}
                // isOnline={"active"}
                image="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTA78Na63ws7B7EAWYgTr9BxhX_Z8oLa1nvOA&usqp=CAU"
              />
            );
          })}
      </div>
    </div>
  );
};

export default ChatList;
