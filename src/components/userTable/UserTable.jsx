import React from "react";
import { useSelector } from "react-redux";
import Table from "react-bootstrap/Table";

const UserTable = () => {
  const { users } = useSelector((state) => state.StoredData);

  console.log("users", users);
  return (
    <Table style={{ width: "100%" }} striped hover>
      <thead style={{ textAlign: "left" }}>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Number</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => {
          return (
            <tr key={index + 1}>
              <td>{user?.name}</td>
              <td>{user?.name.split(" ")[0]}</td>
              <td>{user?.number}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default UserTable;
