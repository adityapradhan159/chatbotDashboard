import { Fragment, useState } from "react";
import { read, utils } from "xlsx";
import axios from "axios";

const ImportCustomers = () => {

    const [excelRows, setExcelRows] = useState([]);
  console.log(excelRows, "excelRows");

  const readUploadFile = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(worksheet);
        setExcelRows(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadData = async () => {
    try {
      const whatsAppBusinessAccountId = localStorage.getItem(
        "whatsAppBusinessAccountId"
      );
      const jokesResponse = await axios.get(
        `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
      );
      const jokeList = jokesResponse.data || [];
      console.log(jokeList, "jokeList");

      const { updatedJokes, newJokes } = excelRows.reduce(
        (result, obj) => {
          const existingJoke = jokeList.find((x) => x.number == obj["number"]);
          console.log(existingJoke, "existingJoke");
          if (existingJoke) {
            // If the joke already exists, add it to the updatedJokes array
            result.updatedJokes.push({
              name: obj["name"] || "",
              number: obj["number"] || "",
              CustomerOwnerAccountId: obj["CustomerOwnerAccountId"] || "",
            });
          } else {
            // If the joke doesn't exist, add it to the newJokes array
            result.newJokes.push({
              name: obj["name"] || "",
              number: obj["number"] || "",
              CustomerOwnerAccountId: obj["CustomerOwnerAccountId"] || "",
            });
          }

          return result;
        },
        { updatedJokes: [], newJokes: [] }
      );

      console.log("Updated Jokes:", updatedJokes);
      console.log("New Jokes:", newJokes);
      if (updatedJokes.length) {
        const result = (
          await axios.post(
            "https://tudoorg.glitch.me/Customer-bulk-update",
            updatedJokes
          )
        ).data;

        if (result) {
          alert("Successfully updated " + updatedJokes.length + " documents");
        }
      }

      if (newJokes.length) {
        const result = (
          await axios.post(
            "https://tudoorg.glitch.me/Customer-bulk-insert",
            newJokes
          )
        ).data;

        if (result) {
          alert("Successfully added " + newJokes.length + " documents");
        }
      }

      //   fetchData();
    } catch (error) {
      console.log("uploadData error: ", error);
    }
  };

  const removeFile = () => {
    setExcelRows([]);
    window.location.reload();
  };


    
  return (
    <Fragment>
      <input
        type="file"
        id="inputEmpGroupFile"
        name="file"
        onChange={readUploadFile}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      <button onClick={uploadData}>Upload</button>
      <button onClick={removeFile}>remove</button>
    </Fragment>
  )
}

export default ImportCustomers