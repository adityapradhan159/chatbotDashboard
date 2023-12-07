// import Box from "@mui/material/Box";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import Select from "@mui/material/Select";
// import { JSONPath } from "jsonpath-plus";
// import "../../SettingComponents/NodeType/NodeType.css";

// import React, { useState } from "react";
// import { Option } from "@mui/base/Option";
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   FormLabel,
//   TextField,
//   TextareaAutosize,
// } from "@mui/material";
// import axios from "axios";
// const Modal = ({
//   setExternalLink,
//   api,
//   open,
//   handleClose,
//   handleClickOpen,
// }) => {
//   const [apiResponse, setApiResponse] = useState({});
//   const [JsonPath, setJsonPath] = useState("");
//   const [CustomVariable, setCustomVariable] = useState("");
//   const [apiMethod,setApiMethod] = useState("get")
//   const [body,setBody] = useState()


//   const [keyValue,setKeyValue] = useState([])

  
//   const [Feilds,setFeilds]=useState([]);
//   const HandleResponse = () => {

//     if(apiMethod == "get"){
//       axios
//       .get(`${api}`)
//       .then((res) => {
//         setApiResponse(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//     }
//     else{
//       axios
//       .post(`${api}`,{
//         "PhoneNumber":"+15550497019",
//         "password":"admin12345"
//       })
//       .then((res) => {
//         setApiResponse(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//     }
    



//   };
//   const HandleExtractData = () => {
//     // if (Object.keys(apiResponse).length === 0) {
//     //   console.log('API response is empty. Make sure to fetch the response first.');
//     //   return;
//     // }

//     try {
//       const data = JSONPath({ path: JsonPath, json: apiResponse });
//       console.log("Extracted Data:", data);
//       setApiResponse(data)
//       localStorage.setItem(CustomVariable, JSON.stringify(data));
//     } catch (error) {
//       console.error("Error extracting data:", error.message);
//     }
//   };


//   const HandleExtractedFeilds=(ExtractedFeilds)=>{
//     const NewExtractedFeilds=ExtractedFeilds.split(',')
//     localStorage.setItem('ExtractedFeilds', JSON.stringify(NewExtractedFeilds));

//     console.log('Extracted Feilds:',NewExtractedFeilds)
//     setFeilds(NewExtractedFeilds)
//   }


//   const handleAddKeyValue = () => {

//     const newItem = {
//       key: 'newKey', // Replace with your actual key
//       value: 'newValue', // Replace with your actual value
//     };

//     // Update the state by spreading the existing items and adding the new item
//     setKeyValue([...keyValue, newItem]);

//     console.log([...keyValue, newItem])
//     console.log("wejfh3iu")

//   }

//   return (
//     <React.Fragment>
//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Edit Request</DialogTitle>
//         <DialogContent>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Select value={apiMethod} onChange={(e)=>setApiMethod(e.target.value)}>
//               <MenuItem value="get">Get</MenuItem>
//               <MenuItem value="post">Post</MenuItem>
//             </Select>
//             <textarea
//               placeholder="Enter Your Api"
//               rows={3}
//               cols={61}
//               style={{
//                 outline: "none",
//                 padding: 5,
//                 outlineColor: "gray",
//                 border: "1px solid #e6e6e6",
//                 borderRadius: 5,
//                 display: "block",
//               }}
//               onChange={(evt) => setExternalLink(evt.target.value)}
//               value={api}
//               className="nodrag"
//             />
//           </div>


//           {
//             keyValue.map((item) => (
//               <div>
//                 <input type="text" />
//                 <input type="text" />
//               </div>
//             ))
            
//           }




//           <button
//             onClick={handleAddKeyValue}
//             style={{
//               textAlign: "center",
//               width: "100%",
//               outline: "none",
//               background: "#4FCCC2",
//               color: "white",
//               padding: "10px 20px 10px 20px",
//               border: "none",
//               borderRadius: 5,
//               display: "block",
//               marginBottom: 5,
//             }}
//           >
//             Add Item
//           </button>



//           <button
//             onClick={HandleResponse}
//             style={{
//               textAlign: "center",
//               width: "100%",
//               outline: "none",
//               background: "#4FCCC2",
//               color: "white",
//               padding: "10px 20px 10px 20px",
//               border: "none",
//               borderRadius: 5,
//               display: "block",
//               marginBottom: 5,
//             }}
//           >
//             Get Response
//           </button>




//           <div
//             style={{
//               overflow: "auto",
//               background: "black",
//               color: "white",
//               padding: 10,
//             }}
//           >
//             <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
//           </div>
//           <div className="list-container">
//             <input
//               onChange={(evt) => setJsonPath(evt.target.value)}
//               value={JsonPath}
//               className="nodrag "
//               style={{
//                 outline: "none",
//                 padding: 5,
//                 outlineColor: "gray",
//                 border: "1px solid #e6e6e6",
//                 borderRadius: 5,
//                 width: "50%",
//                 height: "50px",
//               }}
//               placeholder="JsonPath"
//             />
//             <input
//               onChange={(evt) => setCustomVariable(evt.target.value)}
//               value={CustomVariable}
//               className="nodrag "
//               style={{
//                 outline: "none",
//                 padding: 5,
//                 outlineColor: "gray",
//                 border: "1px solid #e6e6e6",
//                 borderRadius: 5,
//                 width: "50%",
//                 height: "50px",
//               }}
//               placeholder="Custom Variable"
//             />
//             {/* <FormLabel>
//               You Can Add Multiple Feilds with each separate by comma
//             </FormLabel>
//             <input
//               onChange={(evt) => HandleExtractedFeilds(evt.target.value)}
//               className="nodrag "
//               style={{
//                 outline: "none",
//                 padding: 5,
//                 outlineColor: "gray",
//                 border: "1px solid #e6e6e6",
//                 borderRadius: 5,
//                 width: "100%",
//                 height: "50px",
//               }}
//               placeholder="Felids to be Extracted (e.g., Days, Time)"
//             /> */}
//           </div>
//           <button
//             onClick={HandleExtractData}
//             style={{
//               textAlign: "center",
//               width: "100%",
//               outline: "none",
//               background: "#4FCCC2",
//               color: "white",
//               padding: "10px 20px 10px 20px",
//               border: "none",
//               borderRadius: 5,
//               display: "block",
//               marginBottom: 5,
//             }}
//           >
//             Extract Data
//           </button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button onClick={handleClose}>Save</Button>
//         </DialogActions>
//       </Dialog>
//     </React.Fragment>
//   );
// };

// export default Modal;





import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { JSONPath } from "jsonpath-plus";
import "../../SettingComponents/NodeType/NodeType.css";

import React, { useState } from "react";
import { Option } from "@mui/base/Option";
import {setApiType} from "../../redux/Features/Data"
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
import { useDispatch } from "react-redux";
const Modal = ({
  setExternalLink,
  api,
  open,
  handleClose,
  handleClickOpen,
  apiLink,
  handleGetType,
  setMethodType
}) => {
  const [apiResponse, setApiResponse] = useState({});
  const [JsonPath, setJsonPath] = useState("");
  const [CustomVariable, setCustomVariable] = useState("");
  const [apiMethod, setApiMethod] = useState("get");

  const [keyValue, setKeyValue] = useState([]);



  const dispatch = useDispatch()

  const [Feilds, setFeilds] = useState([]);
  const HandleResponse = () => {
    const requestBody = Object.fromEntries(
      keyValue.map((item) => [item.key, item.value])
    );
    if (apiMethod == "get") {
      axios
        .get(`${apiLink}`)
        .then((res) => {
          setApiResponse(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .post(`${apiLink}`, requestBody)
        // .post(`${api}`, {
        //   PhoneNumber: "+15550497019",
        //   password: "admin12345",
        // })
        .then((res) => {
          console.log("Status Code...........",res.status)
          setApiResponse(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const HandleExtractData = () => {
    // if (Object.keys(apiResponse).length === 0) {
    //   console.log('API response is empty. Make sure to fetch the response first.');
    //   return;
    // }

    try {
      const data = JSONPath({ path: JsonPath, json: apiResponse });
      console.log("Extracted Data:", data);
      setApiResponse(data);
      localStorage.setItem(CustomVariable, JSON.stringify(data));
    } catch (error) {
      console.error("Error extracting data:", error.message);
    }
  };

  const HandleExtractedFeilds = (ExtractedFeilds) => {
    const NewExtractedFeilds = ExtractedFeilds.split(",");
    localStorage.setItem("ExtractedFeilds", JSON.stringify(NewExtractedFeilds));

    console.log("Extracted Feilds:", NewExtractedFeilds);
    setFeilds(NewExtractedFeilds);
  };

  // const handleAddKeyValue = () => {
  //   const newItem = {
  //     key: "newKey", // Replace with your actual key
  //     value: "newValue", // Replace with your actual value
  //   };

  //   // Update the state by spreading the existing items and adding the new item
  //   setKeyValue([...keyValue, newItem]);

  //   console.log("keyValue", [...keyValue, newItem]);
  //   console.log("wejfh3iu");
  // };

  const handleAddKeyValue = () => {
    setKeyValue([...keyValue, { key: "", value: "" }]);
    console.log("keyValue", keyValue);
  };

  const handleRemoveKeyValue = (index) => {
    const updatedKeyValue = keyValue.filter((_, i) => i !== index);
    setKeyValue(updatedKeyValue);
  };

  const handleKeyValueChange = (index, key, value) => {
    const updatedKeyValue = keyValue.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    setKeyValue(updatedKeyValue);
  };


  const handleUpdateNode = (e) => {
    setApiMethod(e.target.value)
    
    setNodes((els) => {
      console.log(els);
      return [
        ...els,
        {
          id: Math.random().toString(),
          type: "textUpdater",
          position: { x: 100, y: yPos.current },
          data: {
            name:"Webhook Node",
            apiType:e.target.type
          },
        },
      ];
    });
    // dispatch(setApiType(e.target.value))
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
            <Select
              value={apiMethod}
              onChange={(e) => handleUpdateNode(e)}
            >
              <MenuItem value="get">Get</MenuItem>
              <MenuItem value="post">Post</MenuItem>
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
              value={apiLink}
              className="nodrag"
            />
          </div>

          {/* {keyValue.map((item) => (
            <div>
              <input type="text" />
              <input type="text" />
            </div>
          ))} */}

          {keyValue.map((item, index) => (
            <div key={index}>
              <input
                type="text"
                value={item.key}
                onChange={(e) =>
                  handleKeyValueChange(index, "key", e.target.value)
                }
              />
              <input
                type="text"
                value={item.value}
                onChange={(e) =>
                  handleKeyValueChange(index, "value", e.target.value)
                }
              />
              <Button onClick={() => handleRemoveKeyValue(index)}>
                Remove
              </Button>
            </div>
          ))}

          {apiMethod == "post" && (
            <>
              <button
                onClick={handleAddKeyValue}
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
                Add Item
              </button>
            </>
          )}

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

