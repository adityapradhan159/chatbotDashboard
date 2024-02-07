// ComposeEmailForm.js
import React, { useState } from "react";

const ComposeEmailForm = ({ onClose, onSubmit }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ to, subject, body });
    setTo("");
    setSubject("");
    setBody("");
  };

  return (
    <div className="compose-email-form">
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={to}
          placeholder="To"
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          type="text"
          value={subject}
          placeholder="Subject"
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          value={body}
          placeholder="Write your email here..."
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ComposeEmailForm;
