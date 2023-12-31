import React, { useState } from 'react'
import "./broadcast.css"
import { AiFillFolderAdd } from 'react-icons/ai'
import { FiSend } from 'react-icons/fi'
import { RiArrowDropDownLine } from "react-icons/ri";
import Avatar from '../chatList/Avatar';
import { useSelector } from 'react-redux';
import axios from 'axios';


const Broadcast = () => {

  const {users} = useSelector((state) => state.StoredData)

  const [showUserList,setShowUserList] = useState(true)
  const [agreement, setAgreement] = useState(false);
  const [msg,setMsg] = useState("")
  


  const [customers,setCustomers] = useState([])

  const handleUserList = () => {
    setShowUserList(!showUserList)
  }

  const handleChange = (event,id) => {
    const isChecked = event.target.checked;

    const selectedUser = users.find((user) => user._id === id);

    if (isChecked) {
      // Add the selected user to the customers array
      setCustomers((prevCustomers) => [...prevCustomers, selectedUser]);
    } else {
      // Remove the selected user from the customers array
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer._id !== id)
      );
    }

    setAgreement(isChecked);
  }


  const handleSelectAll = () => {
    // Get the IDs of all users
    const allUserIds = users.map((user) => user._id);

    // Update the customers array with all users
    setCustomers([users]);
    console.log(users)

    // Check all checkboxes by updating the agreement state
    setAgreement(true);

    allUserIds.forEach((id) => {
      handleChange({ target: { checked: true } }, id);
    });


    setShowUserList(false)
  };



  const handleMessage = (e) => {
    setMsg(e.target.value)
  } 



  const HandleSendMessage = () => {

    console.log("Selected Customers",customers)
    setMsg("")

    if(customers.length == 0){
      alert("Select users to send message")
    }

    else if(!msg || msg.length == 0){
      alert("Enter some message!..")
    }

    else{
      customers && customers.map((item) => {
        axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
          "https://graph.facebook.com/v17.0/" +
          localStorage.getItem("PhoneNumberId") +
          "/messages?access_token=" +
          localStorage.getItem("acessToken"),
          data: {
            messaging_product: "whatsapp",
            to: item.number,
            type: "text",
            text: {
              body: msg,
            },
          },
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => {
            console.log(response);
            postChat({
              name: "admin",
              number: item.number,
              chatId: item.number,
              message: msg,
              timestamp: timestamp.toISOString(),
            });
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      })
    }

  }


  const handleCheck = (id) => {
    console.log(id)
    const selectedUser = customers.find((user) => user._id === id);
    console.log(selectedUser)
    if(selectedUser){
      return true
    }
    else{
      return false
    }
  }

  return (
    <div className='Broadcast'>
      <h2>Broadcast</h2>

      <div className="user-list-input">

        <div className="dropdown-container">

        {
          showUserList == true && 

          <div className="userListDropDown">
            <div className="selectAll-btn">
              <button onClick={handleSelectAll}>Select All</button>
            </div>
            
            <div className="cutomer-list">
              {
                users && users.map((item) => (
                  <div className="customer-list-container">
                    <Avatar image={"http://placehold.co/80x80"}  />
                    <h3>{item.name}</h3>
                    <input type="checkbox" checked={handleCheck(item._id)} name='agreement' onChange={(e)=>handleChange(e,item._id)}/>
                  </div>
                ))
              }
            </div>

          </div>
        }

        </div>

        

        <button onClick={handleUserList}>
          Send To
          <RiArrowDropDownLine />

          {/* {
          showUserList == true && 

          <div className="userListDropDown">
            <div className="selectAll-btn">
              <button onClick={handleSelectAll}>Select All</button>
            </div>
            
            <div className="cutomer-list">
              {
                users && users.map((item) => (
                  <div className="customer-list-container">
                    <Avatar image={"http://placehold.co/80x80"}  />
                    <h3>{item.name}</h3>
                    <input type="checkbox" checked={handleCheck(item._id)} name='agreement' onChange={(e)=>handleChange(e,item._id)}/>
                  </div>
                ))
              }
            </div>

          </div>
        } */}


        </button>
        <p>:</p>

        {
          customers && customers.map((item) => (
            item.name ?
            <div className="selectedCustomers">
                <p>{item.name}</p>
            </div>
            :
            <></>
          ))
          
        }
        
      </div>



      <div className="content__footer broadcast-footer">
        <div className="sendNewMessage">
          <button className="addFiles">
            <AiFillFolderAdd />
          </button>
          <input
            type="text"
            placeholder="Type a message here"
            onChange={(e)=>handleMessage(e)}
            value={msg}
          />
          <button
            className="btnSendMsg"
            id="sendMsgBtn"
            // onClick={() => sendMessage(seletedUser?.id._serialized, msg)}
            onClick={() => HandleSendMessage()}
          >
            <FiSend />
          </button>
        </div>
      </div>

    </div>
  )
}

export default Broadcast