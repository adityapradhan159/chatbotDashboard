/* eslint-disable react/prop-types */
import { useEffect } from "react";
import Avatar from "./Avatar";
import { useSeleteduserChatQuery } from "../../redux/Features/MessageApi";
import { setSelectedUsers } from "../../redux/Features/SelectedUser.js";
import { useDispatch, useSelector } from "react-redux";
import { setShowComponent } from "../../redux/Features/SelectedComponent.js";
const ChatListItems = ({
  name,
  user,
  setSelectedUser,
  setSelectedUserMessages,
  animationDelay,
  active,
  isOnline,
}) => {
  const userSelected = useSelector((state) => state.SelectedUser);

  console.log(userSelected, "selected user");
  const { data } = useSeleteduserChatQuery(userSelected,{refetchOnMountOrArgChange:true});
  const dispatch = useDispatch();
  console.log(data, "Mynul");
  // console.log(userSelected, "selected one");


  
  useEffect(() => {
    setSelectedUserMessages(data);
  }, [data,userSelected]);
  const selectChat = (e) => {
    dispatch(setShowComponent("chatContent"))
    
    setSelectedUserMessages(data);
    setSelectedUser(user);
    dispatch(setSelectedUsers(user));
    console.log(user, "user");

    for (
      let index = 0;
      index < e.currentTarget.parentNode.children.length;
      index++
    ) {
      e.currentTarget.parentNode.children[index].classList.remove("active");
    }
    e.currentTarget.classList.add("active");
  };

  return (
    <div
      style={{ animationDelay: `0.${animationDelay}s` }}
      onClick={selectChat}
      className={`chatlist__item ${active ? active : ""}`}
    >
      <Avatar image={"http://placehold.co/80x80"} isOnline={isOnline} />

      <div className="userMeta">
        <p>{name}</p>
        <span className="activeTime">32 mins ago</span>
      </div>
    </div>
  );
};

export default ChatListItems;
