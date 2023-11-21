// /* eslint-disable no-unused-vars */
// import React, { Component } from "react";
// import "./userProfile.css";
// import {AiFillCaretDown} from 'react-icons/ai'



// export default class UserProfile extends Component {


//   toggleInfo = (e) => {
//     e.target.parentNode.classList.toggle("open");
//   };




//   render() {
//     return (
//       <div className="main__userprofile">
//         <div className="profile__card user__profile__image">
//           <div className="profile__image">
//             <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTA78Na63ws7B7EAWYgTr9BxhX_Z8oLa1nvOA&usqp=CAU" />
//           </div>
//           <h4>Fernando Faucho</h4>
//           <p>CEO & Founder at Highly Inc</p>
//         </div>
//         <div className="profile__card">
//           <div className="card__header" onClick={()=>c("/settings")}>
//             <h4>Flow Setting</h4>
//             {/* <AiFillCaretDown/> */}
//           </div>
//           <div className="card__content">
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
//             ultrices urna a imperdiet egestas. Donec in magna quis ligula
//           </div>
//         </div>
//       </div>
//     );
//   }
// }


import React, { useState } from "react";
import "./userProfile.css";
import { AiFillCaretDown } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";

const UserProfile = () => {

  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false);

  const toggleInfo = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`main__userprofile ${isOpen ? "open" : ""}`}>
      <div className="profile__card user__profile__image">
        <div className="profile__image">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTA78Na63ws7B7EAWYgTr9BxhX_Z8oLa1nvOA&usqp=CAU" alt="User Profile" />
        </div>
        <h4>Fernando Faucho</h4>
        <p>CEO & Founder at Highly Inc</p>
      </div>

      <div className="profile__card">
        <div className="card__header" onClick={() => navigate("/settings")}>
          <h4>Flow Setting</h4>
        </div>
      </div>

      <div className="profile__card">
        <div className="card__header" onClick={() => navigate("/importCustomers")}>
          <h4>Import Customers</h4>
        </div>
      </div>



    </div>
  );
}

export default UserProfile;