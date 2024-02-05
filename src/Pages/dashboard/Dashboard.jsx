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
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    body: "",
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("formData", formData.email);
    const jsonData = {
      Recipient: formData.email,
      MessageBody: formData.body,
      Subject: formData.subject,
    };
    try {
      const response = await axios.post(
        `https://tudoorg.glitch.me/sendmail`,
        jsonData
      );
      console.log("response", response); // Handle the response as needed
      setFormData({
        email: "",
        subject: "",
        body: "",
      });

      alert("Email send succesfully");
    } catch (error) {
      console.error("Error sending email:", error);
    }
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
          <>
            <h2>Send Email:</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <br />
              <label>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </label>
              <br />
              <label>
                Body:
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  required
                />
              </label>
              <br />
              <button type="submit">Send Email</button>
            </form>
          </>
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
