import React, { useEffect, useState } from "react";
import UserProfile from "../../components/userProfile/UserProfile";
import ChatBody from "../../components/chatBody/ChatBody";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFlowData } from "../../redux/Features/Data";
import { useSelector } from "react-redux";
import axios from "axios";

const Dashboard = ({
  messages,
  navTab,
  seletedUserMessages,
  setSelectedUserMessages,
  AllChats,
  setAllChats,
  sendMessage,
  seletedUser,
  setSelectedUser,
  FetchAllMessages,
  showModal,
  setShowModal,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { flowData } = useSelector((state) => state.StoredData);

  //   console.log(
  //     "flowData================================================",
  //     flowData
  //   );
  const [flowName, setFlowName] = useState("");

  const handleFlowModal = () => {
    setShowModal(!showModal);
  };

  const whatsAppBusinessAccountId = localStorage.getItem(
    "whatsAppBusinessAccountId"
  );

  const [flowList, setFlowList] = useState([]);

  useEffect(() => {
    axios
      .get(
        `https://tudoorg.glitch.me/api/flowList?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
      )
      .then((res) => {
        console.log(res, "Flow list array");
        setFlowList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleSaveFlow = () => {
    setShowModal(!showModal);
    const newFlowData = [...flowData, flowName];
    dispatch(setFlowData(newFlowData));
    setFlowName("");

    console.log(flowName, "efoiwe");

    const flowId = `flowId-${flowName}`;
    localStorage.setItem("flowId", flowId);

    axios
      .post(
        `https://tudoorg.glitch.me/api/flowList?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`,
        {
          flowId: `flowId-${flowName}`,
          flowName,
          whatsAppBusinessAccountId: whatsAppBusinessAccountId,
        }
      )
      .then((res) => {
        console.log(res);
        axios
          .get(
            `https://tudoorg.glitch.me/api/flowList?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
          )
          .then((res) => {
            console.log(res, "Flow list array");
            setFlowList(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSpecificFlow = (id) => {
    localStorage.setItem("flowId", id);
  };

  return (
    <div className="__main">
      {messages &&
        messages.map((itm, index) => {
          return <div key={index}>{itm.body}</div>;
        })}
      {/* <Nav /> */}
      <UserProfile />

      <div className="sideTabBody">
        {navTab == 0 ? (
          <ChatBody
            seletedUserMessages={seletedUserMessages}
            setSelectedUserMessages={setSelectedUserMessages}
            AllChats={AllChats}
            setAllChats={setAllChats}
            sendMessage={sendMessage}
            seletedUser={seletedUser}
            setSelectedUser={setSelectedUser}
            FetchAllMessages={FetchAllMessages}
          />
        ) : navTab == 1 ? (
          <></>
        ) : navTab == 2 ? (
          <div className="automationDiv">
            <button onClick={handleFlowModal}>Create a flow</button>

            {showModal == true && (
              <div className="flowModal">
                <label htmlFor="">Please enter flow name.</label>
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                />
                <button onClick={handleSaveFlow}>Save</button>
              </div>
            )}

            <div className="flowLists" onClick={() => navigate("/settings")}>
              {flowList &&
                flowList.map((data, index) => {
                  return (
                    <ul key={index}>
                      {/* <div className="flowStatus"></div> */}
                      <div
                        className="flowName flowList flowStatus"
                        onClick={() => handleSpecificFlow(data.flowId)}
                      >
                        {data.flowName}
                      </div>
                    </ul>
                  );
                })}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
