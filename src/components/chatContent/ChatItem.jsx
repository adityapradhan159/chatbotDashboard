/* eslint-disable react/prop-types */
import Avatar from "../chatList/Avatar";

const ChatItem = ({ user, msg, image }) => {
  console.log(msg?._data?.list?.sections[0]?.rows, "sections");
  return (
    <>
      {msg.name !== "admin" ? (
        <div
          style={{ animationDelay: `0.8s`, justifyContent: "flex-start" }}
          className={`chat__item ${user ? user : ""}`}
        >
          <Avatar 
          // isOnline="active" 
          image={image} />

          <div className="chat__item__content">
            {typeof msg.message === "object" ? (
              <div>
                <div className="chat__msg">{msg.message.title}</div>
                <div className="chat__msg">{msg.message.description}</div>
              </div>
            ) : (
              <div className="chat__msg">{msg.message}</div>
            )}
            <div className="chat__meta">
              <span>16 mins ago</span>
              <span>Seen 1.03PM</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ animationDelay: `0.8s`, justifyContent: "flex-end" }}
          className={`chat__item ${user ? user : ""}`}
        >
          <div className="chat__item__content">
            <div className="chat__msg">{msg.message}</div>
            <div className="chat__meta">
              <span>16 mins ago</span>
              <span>Seen 1.03PM</span>
            </div>
          </div>

          <Avatar 
          // isOnline="active"
           image={image} />
        </div>
      )}
    </>
  );
};

export default ChatItem;
