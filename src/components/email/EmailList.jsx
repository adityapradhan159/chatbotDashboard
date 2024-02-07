// EmailList.js
import React from "react";
import Table from "react-bootstrap/Table";
import "./email.css";

const EmailList = ({ emails, onComposeClick }) => {
  // Dummy email list for demonstration
  const dummyEmails = [
    {
      id: 1,
      subject: "Meeting Reminder",
      sender: "john@example.com",
      date: "2024-02-05",
    },
    {
      id: 2,
      subject: "Proposal Discussion",
      sender: "alice@example.com",
      date: "2024-02-04",
    },
    {
      id: 3,
      subject: "Project Updates",
      sender: "bob@example.com",
      date: "2024-02-03",
    },
  ];

  return (
    // <div className="email-list">
    //   <div className="compose-button" onClick={onComposeClick}>
    //     Compose
    //   </div>
    //   <table>
    //     <thead>
    //       <tr>
    //         <th></th>
    //         <th>Subject</th>
    //         <th>Sender</th>
    //         <th>Date</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {dummyEmails.map((email) => (
    //         <tr key={email.id}>
    //           <td>
    //             <input type="checkbox" />
    //           </td>
    //           <td>{email.subject}</td>
    //           <td>{email.sender}</td>
    //           <td>{email.date}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
    <Table style={{ width: "100%" }} striped bordered hover>
      <thead style={{ textAlign: "left" }}>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Larry the Bird</td>
          <td>@twitter</td>
          <td>Larry the Bird</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default EmailList;
