import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { JSONPath } from "jsonpath-plus";
import "../../SettingComponents/NodeType/NodeType.css";

import React, { useState } from "react";
import { Option } from "@mui/base/Option";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormLabel,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import axios from "axios";
const Modal = ({
  setExternalLink,
  api,
  open,
  handleClose,
  handleClickOpen,
}) => {
  const [apiResponse, setApiResponse] = useState({});
  const [JsonPath, setJsonPath] = useState("");
  const [CustomVariable, setCustomVariable] = useState("");
  
  const [Feilds,setFeilds]=useState([]);
  const HandleResponse = () => {
    axios
      .get(`${api}`)
      .then((res) => {
        setApiResponse(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const HandleExtractData = () => {
    // if (Object.keys(apiResponse).length === 0) {
    //   console.log('API response is empty. Make sure to fetch the response first.');
    //   return;
    // }

    try {
      const data = JSONPath({ path: JsonPath, json: apiResponse });
      console.log("Extracted Data:", data);
      setApiResponse(data)
      localStorage.setItem(CustomVariable, JSON.stringify(data));
    } catch (error) {
      console.error("Error extracting data:", error.message);
    }
  };
const HandleExtractedFeilds=(ExtractedFeilds)=>{

const NewExtractedFeilds=ExtractedFeilds.split(',')
localStorage.setItem('ExtractedFeilds', JSON.stringify(NewExtractedFeilds));

console.log('Extracted Feilds:',NewExtractedFeilds)
setFeilds(NewExtractedFeilds)
}
  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Request</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Select value="Get">
              <MenuItem value="Get">Get</MenuItem>
              <MenuItem value="Post">Post</MenuItem>
            </Select>
            <textarea
              placeholder="Enter Your Api"
              rows={3}
              cols={61}
              style={{
                outline: "none",
                padding: 5,
                outlineColor: "gray",
                border: "1px solid #e6e6e6",
                borderRadius: 5,
                display: "block",
              }}
              onChange={(evt) => setExternalLink(evt.target.value)}
              value={api}
              className="nodrag"
            />
          </div>
          <button
            onClick={HandleResponse}
            style={{
              textAlign: "center",
              width: "100%",
              outline: "none",
              background: "#4FCCC2",
              color: "white",
              padding: "10px 20px 10px 20px",
              border: "none",
              borderRadius: 5,
              display: "block",
              marginBottom: 5,
            }}
          >
            Get Response
          </button>
          <div
            style={{
              overflow: "auto",
              background: "black",
              color: "white",
              padding: 10,
            }}
          >
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
          <div className="list-container">
            <input
              onChange={(evt) => setJsonPath(evt.target.value)}
              value={JsonPath}
              className="nodrag "
              style={{
                outline: "none",
                padding: 5,
                outlineColor: "gray",
                border: "1px solid #e6e6e6",
                borderRadius: 5,
                width: "50%",
                height: "50px",
              }}
              placeholder="JsonPath"
            />
            <input
              onChange={(evt) => setCustomVariable(evt.target.value)}
              value={CustomVariable}
              className="nodrag "
              style={{
                outline: "none",
                padding: 5,
                outlineColor: "gray",
                border: "1px solid #e6e6e6",
                borderRadius: 5,
                width: "50%",
                height: "50px",
              }}
              placeholder="Custom Variable"
            />
            {/* <FormLabel>
              You Can Add Multiple Feilds with each separate by comma
            </FormLabel>
            <input
              onChange={(evt) => HandleExtractedFeilds(evt.target.value)}
              className="nodrag "
              style={{
                outline: "none",
                padding: 5,
                outlineColor: "gray",
                border: "1px solid #e6e6e6",
                borderRadius: 5,
                width: "100%",
                height: "50px",
              }}
              placeholder="Felids to be Extracted (e.g., Days, Time)"
            /> */}
          </div>
          <button
            onClick={HandleExtractData}
            style={{
              textAlign: "center",
              width: "100%",
              outline: "none",
              background: "#4FCCC2",
              color: "white",
              padding: "10px 20px 10px 20px",
              border: "none",
              borderRadius: 5,
              display: "block",
              marginBottom: 5,
            }}
          >
            Extract Data
          </button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Modal;
