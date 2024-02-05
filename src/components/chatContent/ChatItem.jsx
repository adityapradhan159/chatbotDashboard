/* eslint-disable react/prop-types */
import Avatar from "../chatList/Avatar";

const ChatItem = ({ user, msg, image }) => {
  console.log(msg?._data?.list?.sections[0]?.rows, "sections");
  return (
    <>
      {msg.name !== "admin" ? (
        <div
          style={{ animationDelay: `0.8s`, justifyContent: "flex-end" }}
          className={`chat__item ${user ? user : ""}`}
        >
          
          <div className="chat__item__content chat__item__content__admin">
            {typeof msg.message === "object" ? (
              <div>
                <div className="chat__msg">{msg.message.title}</div>
                <div className="chat__msg">{msg.message.description}</div>
              </div>
            ) : (
              <div className="chat__msg">{msg.message}</div>
            )}
            <div className="chat__meta">
              {/* <span>16 mins ago</span> */}
              <span>1.08PM</span>
            </div>
          </div>

          <Avatar
            // isOnline="active"
            image={image}
          />
        </div>
      ) : (
        <div
          style={{ animationDelay: `0.8s`, justifyContent: "flex-start" }}
          className={`chat__item ${user ? user : ""}`}
        >

          <Avatar
            // isOnline="active"
            image={image}
          />
          <div className="chat__item__content chat__item__content__user">
            <div className="chat__msg">{msg.message}</div>
            <div className="chat__meta">
              {/* <span>16 mins ago</span> */}
              <span>1.18 PM</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatItem;
// D9FDD3