const express = require("express");
var cors = require("cors");
const body_parser = require("body-parser");
const axios = require("axios").default;
const app = express().use(body_parser.json()); // creates express http server
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {JSONPath} = require('jsonpath-plus');
const { check, validationResult } = require("express-validator");
var http = require("http");
// const { Server } = require("socket.io");
const server = http.createServer(app);
app.use(express.json());
app.use(cors());

// origin: ['http://localhost:*', 'https://adminchatbotdashboard.netlify.app/'],
// origin: ['http://localhost:*', 'https://adminchatbotdashboard.netlify.app:*'],

// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://adminchatbotdashboard.netlify.app",
//       "https://wpbot.netlify.app",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

const token = process.env.WHATSAPP_TOKEN;

const uri = `mongodb+srv://technet-server:57cioPlRjZB1EmZu@parental-control.blsirns.mongodb.net/?retryWrites=true&w=majority`;
const timestamp = new Date(); // Current timestamp

let {
  welcome_msg,
  locations,
  liveZoom,
  privateclass,
  superfast,
  timeSlots,
} = require("./template.js");

let destinationArray;
let showMessage = true;
let dynamicListMsg = []
let studioTimings;
// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
server.listen(process.env.PORT || 1337, () => {
  axios
    .get(
      `https://us-central1-btay-project-1551779459124.cloudfunctions.net/AY/get/studioBatchTiming`
    )
    .then((res) => {
      // console.log("Studio Batches",res.data.data)

      studioTimings = res.data.data;
    })
    .catch((err) => {
      console.log(err);
    });

  console.log("webhook is listening");
});

db.once("open", () => {
  console.log("Connected to MongoDB");
  const ChatMessages = db.collection("ChatMessages");
  const admin = db.collection("Admins");
  const Customers = db.collection("Customers");
  const ChatFlows = db.collection("ChatFlows");
  app.post("/api/chat", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      const data = req.body;
      // Create a new chat message document
      const result = await ChatMessages.insertOne(req.body);

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });
  //   app.post("/api/chatFlow", async (req, res) => {
  //     try {
  //       // Assuming your request body contains sender and content
  //       const data = req.body;
  //       // console.log(JSON.parse(data) ,"data")
  //       // Create a new chat message document
  //       const result = await ChatFlows.insertOne(req.body);

  //       res.status(200).json(result); //rsnd with the saved message
  //     } catch (error) {
  //       res.status(500).json({ error: "Failed to save the message." });
  //     }
  //   });
  app.put("/api/chatFlow/", async (req, res) => {
    try {
      const { whatsAppBusinessAccountId } = req.query;
      const data = req.body;

      // Check if the document exists
      const existingDocument = await ChatFlows.findOne({
        whatsAppBusinessAccountId: whatsAppBusinessAccountId,
      });

      if (existingDocument) {
        // Document exists, update it
        const result = await ChatFlows.updateOne(
          { whatsAppBusinessAccountId: whatsAppBusinessAccountId },
          { $set: data }
        );

        res.status(200).json({ message: "Message updated successfully." });
      } else {
        // Document doesn't exist, insert a new one
        const result = await ChatFlows.insertOne({
          whatsAppBusinessAccountId: whatsAppBusinessAccountId,
          ...data,
        });

        res.status(200).json({ message: "New message created successfully." });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to update or create the message." });
    }
  });

  app.post("/api/customer", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // console.log(req.body);
      const data = req.body.number;
      // console.log(data);

      const existingCustomer = await Customers.countDocuments({ number: data });

      if (existingCustomer === 0) {
        // If the customer doesn't exist, insert a new record
        const result = await Customers.insertOne(req.body);
        res.status(200).json(result); // Respond with the saved message
      } else {
        // If the customer exists, update the existing record
        const result = await Customers.updateOne(
          { number: data },
          { $set: req.body }
        );
        res.status(200).json(result); // Respond with the updated message
      }

      // console.log(existingCustomer);

      // Create a new chat message document
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });

  app.get("/api/customer", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // Create a new chat message document
      const whatsAppBusinessAccountId = req.query.whatsAppBusinessAccountId;

      const result = await Customers.find({
        CustomerOwnerAccountId: whatsAppBusinessAccountId,
      }).toArray();

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });
  app.get("/api/specificcustomer", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // Create a new chat message document
      const number = req.query.number;

      const result = await Customers.find({
        number: number,
      }).toArray();

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });
  app.get("/api/admin", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // Create a new chat message document
      const PhoneNumberId = req.query.PhoneNumberId;

      const result = await admin
        .find({
          PhoneNumberId: PhoneNumberId,
        })
        .toArray();

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });
  app.get("/api/chat", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // Create a new chat message document
      const whatsAppBusinessAccountId = req.query.whatsAppBusinessAccountId;
      const chatId = req.query.chatId;
      const result = await ChatMessages.find({
        whatsAppBusinessAccountId: whatsAppBusinessAccountId,
        chatId: chatId,
      }).toArray();

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });
  app.get("/api/chatFlow", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // Create a new chat message document
      const whatsAppBusinessAccountId = req.query.whatsAppBusinessAccountId;
      const result = await ChatFlows.find({
        whatsAppBusinessAccountId: whatsAppBusinessAccountId,
      }).toArray();

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });

  app.post(
    "/api/register",
    [
      check("name").isLength({ min: 3 }),
      check("accesToken").isLength({ min: 6 }),
      check("PhoneNumberId").isLength({ min: 15 }),
      check("whatsAppBusinessAccountId").isLength({ min: 15 }),
      check("PhoneNumber").isLength({ min: 10 }),
      check("password").isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const {
          name,
          accesToken,
          PhoneNumberId,
          whatsAppBusinessAccountId,
          PhoneNumber,
          password,
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
          name,
          accesToken,
          PhoneNumberId,
          whatsAppBusinessAccountId,
          PhoneNumber,
          hashedPassword,
        };
        const result = await admin.insertOne(user);
        // Create a new chat message document
        res.status(200).json({
          status: true,
        }); //rsnd with the saved message
      } catch (error) {
        res.status(500).json({ error: "Failed to save the message." });
      }
    }
  );

  app.post("/api/login", async (req, res) => {
    try {
      const Admin = await admin.findOne({ PhoneNumber: req.body.PhoneNumber });

      if (!Admin) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      const passwordMatch = await bcrypt.compare(
        req.body.password,
        Admin.hashedPassword
      );

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password." });
      }
      const result = await Customers.find({
        CustomerOwnerAccountId: Admin.whatsAppBusinessAccountId,
      }).toArray();

      res.status(200).json({
        result,
        whatsAppBusinessAccountId: Admin.whatsAppBusinessAccountId,
        accessToken: Admin.accesToken,
        PhoneNumberId: Admin.PhoneNumberId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to login." });
    }
  });

  app.post("/Customer-bulk-insert", async (req, res, next) => {
    try {
      const jokes = req.body;

      await Customers.insertMany(jokes, (error, docs) => {
        if (docs) {
          res
            .status(200)
            .json({ success: true, message: "jokes-bulk-insert success" });
        }
        if (error) {
          console.log("insertMany error: ", error);
          res.status(400).json({
            success: false,
            error: error,
            message: "jokes-bulk-insert failed",
          });
        }
      });
    } catch (err) {
      console.error("jokes-bulk-insert error: ", err);
      res
        .status(500)
        .json({ success: false, message: "internal_server_error" });
    }
  });
  app.post("/Customer-bulk-update", async (req, res, next) => {
    try {
      const jokes = req.body;
      // console.log(jokes, "jokes");

      const updatePromises = jokes.map(async (item) => {
        try {
          const customerOwnerAccountId = item.CustomerOwnerAccountId; // Replace 'CustomerOwnerAccountId' with the actual field name
          // Use a different variable name for the result of the update
          const updateResult = await Customers.updateMany(
            {
              CustomerOwnerAccountId: customerOwnerAccountId,
              number: item.number,
            },

            {
              $set: { ...item },
            }
          );

          return updateResult;
        } catch (updateError) {
          // Log the specific error for each update
          console.error("Update error for item ", item._id, ":", updateError);
          throw updateError; // Re-throw the error to be caught in the Promise.all catch block
        }
      });
      // console.log(updatePromises);
      Promise.all(updatePromises)
        .then(() =>
          res.json({ success: true, message: "jokes-bulk-update success" })
        )
        .catch((err) => {
          console.error("Bulk update error: ", err);
          res
            .status(400)
            .json({ success: false, message: "bulk_update_error" });
        });
    } catch (err) {
      console.error("jokes-bulk-update error: ", err);
      res
        .status(500)
        .json({ success: false, message: "internal_server_error" });
    }
  });

  app.post("/webhook", (req, res) => {
    // Parse the request body from the POST
    let body = req.body;
    const whatsAppBusinessAccountId = req.body.entry[0].id;


    // console.log(whatsAppBusinessAccountId, "whatsppbvusinesaccounid");
    // console.log(req.body,)
    // Check the Incoming webhook message
    // console.log("Data messages", JSON.stringify(req.body, null, 2));
    // console.log("Interactive",req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.title)

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    
    
    
    if (req.body.object) {
      
      console.log(req.body,"Body")
      console.log(req.body.entry[0].messaging,"Body")
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id =
          req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let user = req.body.entry[0].changes[0].value.contacts[0].profile.name;

//         console.log(
//           "REceived messages",
//           req.body.entry[0].changes[0].value.messages[0]
//         );

        let msg_body;

        // console.log(user);

        let selectedOption;
        let selectedOptionId;

        if (req.body.entry[0].changes[0].value.messages[0].interactive) {
          // msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.title

          if (
            req.body.entry[0].changes[0].value.messages[0].interactive
              .list_reply
          ) {
            selectedOption =
              req.body.entry[0].changes[0].value.messages[0].interactive
                .list_reply.title;

            selectedOptionId =
              req.body.entry[0].changes[0].value.messages[0].interactive
                .list_reply.id;
          } else if (
            req.body.entry[0].changes[0].value.messages[0].interactive
              .button_reply
          ) {
            selectedOption =
              req.body.entry[0].changes[0].value.messages[0].interactive
                .button_reply.title;

            selectedOptionId =
              req.body.entry[0].changes[0].value.messages[0].interactive
                .button_reply.id;
          }
        } else {
          msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
        }
       
        console.log("selectedOptionId", selectedOptionId);
        console.log("selectedOption", selectedOption);

        axios
          .post("https://tudoorg.glitch.me/api/chat", {
            name: user,
            number: from,
            chatId: from,
            whatsAppBusinessAccountId: whatsAppBusinessAccountId,
            message:
              msg_body ||
              req.body.entry[0].changes[0].value.messages[0].interactive
                .list_reply,
            timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
          })
          .then((response) => {
            // Handle the response from your server
            // console.log("Message saved:", response.data);
          })
          .catch((error) => {
            // Handle any errors
            console.error("Error:", error);
          });

        /// trying multi organization
        axios
          .get(`https://tudoorg.glitch.me/api/specificcustomer?number=${from}`)
          .then((res) => {
            // console.log(res.data, "datasss");

            if (res.data.length == 0) {
              axios
                .post("https://tudoorg.glitch.me/api/customer", {
                  name: user,
                  number: from,
                  CustomerOwnerAccountId: [whatsAppBusinessAccountId],
                })
                .then((response) => {
                  // console.log(response);
                  // Handle the response from your server
                  // console.log("Message saved:", response.data);
                })
                .catch((error) => {
                  // Handle any errors
                  console.error("Error:", error);
                });
            } else {
              axios
                .post("https://tudoorg.glitch.me/api/customer", {
                  name: user,
                  number: from,
                  CustomerOwnerAccountId: [
                    ...res.data[0].CustomerOwnerAccountId,
                    whatsAppBusinessAccountId,
                  ],
                })
                .then((response) => {
                  // console.log(response);
                  // Handle the response from your server
                  // console.log("Message saved:", response.data);
                })
                .catch((error) => {
                  // Handle any errors
                  console.error("Error:", error);
                });
            }
          });

        axios
          .get(
            `https://tudoorg.glitch.me/api/chatFlow?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
          )
          .then((res) => {
            // console.log("conversation flow", res.data[0].nodes);

            res.data[0].nodes.map((node) => {
              

              //==========================Checking Node text length===========================//
              if (node.data.text) {
                // console.log("i am coming", node.data.name);

                // console.log("Node Length")
                node.data.text.map((text) => {

                  if (text.content == msg_body && text.type == "text") {
                    console.log(text.nodeId, "id");

                    res.data[0].edges.map((edge) => {
                      if (edge.source == text.nodeId) {
                        // console.log(edge.target, "targetNodeId");

                        let filteredNodesArray = res.data[0].nodes.filter(
                          function (element) {
                            return element.id == edge.target;
                          }
                        );

                        // console.log("FilteredArray", filteredNodesArray);

                        filteredNodesArray.map((node) => {
                          
                        //===============If the next node is webhook node====================//
                          if (node.data.name == "Webhook Node") {

                            axios
                                  .get(`${node.data.text[0].content}`, 
                                )
                                  .then((response) => {
                                    // console.log("Status Code...........",response.status)
                                    // console.log("res",response.data)
                              
                                    const filteredEdges = res.data[0].edges.filter((el) => {
                                    // console.log(el,"Filtered Edge")
                                    return (
                                      node.data.text[0].nodeId == el.source 
                                    );
                                  });

                                  // console.log(filteredEdges,"Filtered Edges")


                                  const filteredNode = res.data[0].nodes.filter((el) => {
                                    // console.log(el,"Element")
                                    return (
                                      filteredEdges[0].target == el.id 
                                    );
                                  });

                                  // console.log(filteredNode,"filtered Node")
                              
                                    const HandleExtractData = () => {
                                      // if (Object.keys(apiResponse).length === 0) {
                                      //   console.log('API response is empty. Make sure to fetch the response first.');
                                      //   return;
                                      // }

                                      try {
                                        // const data = JSONPath({ path: node.data.fetchedData, json:response.data });
                                        // console.log("Extracted Data:", data);
                                        node.data.customFields.forEach((customFieldItem, index) => {
                                        const { jsonPath, variable } = customFieldItem;

                                        if (!jsonPath) {
                                          // console.error('JSONPath is empty for custom field at index', index);
                                          return;
                                        }

                                        const data = JSONPath({ path: jsonPath, json: response.data });
                                          
                                        // console.log(data,"Data Json Path.......")
                                          
                                          
                                          if(data.length > 1){
                                            
                                            dynamicListMsg = data
                                            
                                            let newArray = data.map(
                                            (item,id) => ({
                                              id: `handle${id}-`+ node.id,
                                              title: item,
                                              description: "",
                                            })
                                          );
                                        
                                        axios.get(`https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`)
                                        .then((res) => {
                                          const adityaToken = res.data[0].accesToken;
                                          
                                          
                                          axios({
                                      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                                      url:
                                        "https://graph.facebook.com/v17.0/" +
                                        phone_number_id +
                                        "/messages?access_token=" +
                                        adityaToken,
                                      data: {
                                        messaging_product: "whatsapp",
                                        to: from,
                                        type: "interactive",
                                      interactive: {
                                        type: "list",
                                        body: {
                                          text: filteredNode[0].data.text[0].content,
                                        },
                                        action: {
                                          button: "Please Select",
                                          sections: [
                                            {
                                              rows: newArray,
                                            },
                                          ],
                                        },
                                      },
                                      },
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                    })
                                    .then((res) => {
                                        console.log(res)
                                      })
                                    .catch((err) => {
                                          console.log(err)
                                        })
                                          
                                          
                                        })
                                        .catch((err) => {
                                          console.log(err)
                                        })
                                            
                                      }    
                                        
                                       }); 
                                        
                                      } catch (error) {
                                        console.error("Error extracting data:", error.message);
                                      }
                                    };
                              
                                  HandleExtractData()                       

                                  })
                                  .catch((err) => {
                                    console.log(err);
                                });
                          }

                          else if (
                            node.data.text.length == 1 &&
                            node.data.name !== "Http Node" || node.data.text.length == 1 && node.data.name !== "Webhook Node"
                          ) {
                            // console.log("This is a text message");

                            node.data.text.map((text) => {
                              if (text.nodeId == edge.target) {
                                // console.log(node.data.text, "Node Text wjebdniwefjbwein");

                                axios
                                  .get(
                                    `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                  )
                                  .then((res) => {
                                    // console.log(res.data, "admin data");
                                    const adityaToken = res.data[0].accesToken;

                                    axios({
                                      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                                      url:
                                        "https://graph.facebook.com/v17.0/" +
                                        phone_number_id +
                                        "/messages?access_token=" +
                                        adityaToken,
                                      data: {
                                        messaging_product: "whatsapp",
                                        to: from,
                                        type: "text",
                                        text: {
                                          body: text.dynamicContent.length > 0 ? text.dynamicContent :  text.content,
                                        },
                                      },
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                    })
                                      .then((res) => {
                                        // console.log("Response",res)

                                        axios
                                          .post(
                                            "https://tudoorg.glitch.me/api/chat",
                                            {
                                              name: "admin",
                                              whatsAppBusinessAccountId:
                                                whatsAppBusinessAccountId,
                                              chatId: from,
                                              message: text.content,
                                              timestamp:
                                                timestamp.toISOString(), // Convert the Date object to an ISO string
                                            }
                                          )
                                          .then((response) => {
                                            // Handle the response from your server
                                            // console.log("Message saved:", response.data);
                                          })
                                          .catch((error) => {
                                            // Handle any errors
                                            console.error("Error:", error);
                                          });
                                      })

                                      .catch((err) => {
                                        console.log("Error", err);
                                      });
                                  });
                              }
                            });
                          } else if(node.data.text.length > 1 && node.data.name !== "Http Node" || node.data.text.length > 1 && node.data.name !== "Webhook Node") {
                            console.log("This is a Interactive Message");

                            // console.log(node);

                            let filteredNodeTextArray = node.data.text.filter(
                              function (element) {
                                return element.type == "text";
                              }
                            );

                            let filteredNodeButtonArray = node.data.text.filter(
                              function (element) {
                                return (
                                  element.type !== "text" &&
                                  element.type !== "button"
                                );
                              }
                            );

                            let filteredNodeReplyButtonArray =
                              node.data.text.filter(function (element) {
                                return (
                                  element.type !== "text" &&
                                  element.type !== "list"
                                );
                              });

                            let newArray = filteredNodeButtonArray.map(
                              (item) => ({
                                id: item.id + item.nodeId,
                                title: item.content,
                                description: "",
                              })
                            );

                            let newButtonArray =
                              filteredNodeReplyButtonArray.map((item) => ({
                                type: "reply",
                                reply: {
                                  id: item.id + item.nodeId,
                                  title: item.content,
                                },
                              }));

                            // console.log("newButtonArray", newButtonArray);

                            // console.log("New array", newArray);

                            // console.log("filteredNodeTextArray",filteredNodeTextArray)
                            // console.log(
                            //   "filteredNodeButtonArray",
                            //   filteredNodeButtonArray
                            // );

                            if (filteredNodeButtonArray.length > 1) {
                              axios
                                .get(
                                  `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                )
                                .then((res) => {
                                  // console.log(res.data, "admin data");
                                  const adityaToken = res.data[0].accesToken;
                                  axios({
                                    method: "POST",
                                    url:
                                      "https://graph.facebook.com/v17.0/" +
                                      phone_number_id +
                                      "/messages?access_token=" +
                                      adityaToken,
                                    data: {
                                      messaging_product: "whatsapp",
                                      to: from,
                                      type: "interactive",
                                      interactive: {
                                        type: "list",
                                        body: {
                                          text: filteredNodeTextArray[0]
                                            .content,
                                        },
                                        action: {
                                          button: "Please Select",
                                          sections: [
                                            {
                                              rows: newArray,
                                            },
                                          ],
                                        },
                                      },
                                    },
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                  })
                                    .then((res) => {
                                      // console.log("Response",res)

                                      axios
                                        .post(
                                          "https://tudoorg.glitch.me/api/chat",
                                          {
                                            name: "admin",
                                            whatsAppBusinessAccountId:
                                              whatsAppBusinessAccountId,
                                            chatId: from,
                                            message: text.content,
                                            timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                          }
                                        )
                                        .then((response) => {
                                          // Handle the response from your server
                                          // console.log("Message saved:", response.data);
                                        })
                                        .catch((error) => {
                                          // Handle any errors
                                          console.error("Error:", error);
                                        });
                                    })

                                    .catch((err) => {
                                      console.log("Error", err);
                                    });
                                });
                            } else {
                              axios
                                .get(
                                  `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                )
                                .then((res) => {
                                  // console.log(res.data, "admin data");
                                  const adityaToken = res.data[0].accesToken;
                                  axios({
                                    method: "POST",
                                    url:
                                      "https://graph.facebook.com/v17.0/" +
                                      phone_number_id +
                                      "/messages?access_token=" +
                                      adityaToken,
                                    data: {
                                      messaging_product: "whatsapp",
                                      to: from,
                                      type: "interactive",
                                      interactive: {
                                        type: "button",
                                        body: {
                                          text: filteredNodeTextArray[0]
                                            .content,
                                        },
                                        action: {
                                          buttons: newButtonArray,
                                          // [
                                          //   {
                                          //     "type": "reply",
                                          //     "reply": {
                                          //       "id": "0",
                                          //       "title": "Main menu"
                                          //     }
                                          //   },
                                          //   {
                                          //     "type": "reply",
                                          //     "reply": {
                                          //       "id": "1",
                                          //       "title": "Visit website"
                                          //     }
                                          //   }
                                          // ]
                                        },
                                      },
                                    },
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                  })
                                    .then((res) => {
                                      // console.log("Response",res)

                                      axios
                                        .post(
                                          "https://tudoorg.glitch.me/api/chat",
                                          {
                                            name: "admin",
                                            whatsAppBusinessAccountId:
                                              whatsAppBusinessAccountId,
                                            chatId: from,
                                            message: text.content,
                                            timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                          }
                                        )
                                        .then((response) => {
                                          // Handle the response from your server
                                          // console.log("Message saved:", response.data);
                                        })
                                        .catch((error) => {
                                          // Handle any errors
                                          console.error("Error:", error);
                                        });
                                    })

                                    .catch((err) => {
                                      console.log("Error", err);
                                    });
                                });
                            }
                          }
                          
                          
                          else if(node.data.text.length == 1 && node.data.name == "Webhook Node"){
                              // console.log("This is the webhook node")  
                          }   
                          
                          
                        });
                      }
                    });
                  } else if (
                    text.content == selectedOption 
                    &&
                    text.id + text.nodeId == selectedOptionId && !text.dynamicList
                  ) {


                    const filteredEdges = res.data[0].edges.filter((el) => {
                      return (
                        text.nodeId == el.source &&
                        text.sourceHandle == el.sourceHandle
                      );
                    });

                    // console.log("filteredEdges", filteredEdges);

                    const filteredNodeEdges = res.data[0].nodes.filter((el) => {
                      return filteredEdges[0]?.target == el.id;
                    });

                    // console.log("filteredNodeEdges", filteredNodeEdges);

                    // console.log("FilteredEdges",filteredEdges)

                    if (
                      filteredNodeEdges.length > 0 &&
                      filteredNodeEdges[0].data.text.length == 1
                    ) {
                      axios
                        .get(
                          `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                        )
                        .then((res) => {
                          // console.log(res.data, "admin data");
                        // console.log('yes i am')
                          const adityaToken = res.data[0].accesToken;

                          axios({
                            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                            url:
                              "https://graph.facebook.com/v17.0/" +
                              phone_number_id +
                              "/messages?access_token=" +
                              adityaToken,
                            data: {
                              messaging_product: "whatsapp",
                              to: from,
                              type: "text",
                              text: {
                                body: filteredNodeEdges[0].data.text[0].content,
                              },
                            },
                            headers: {
                              "Content-Type": "application/json",
                            },
                          })
                            .then((res) => {
                              // console.log("Response",res)

                              axios
                                .post("https://tudoorg.glitch.me/api/chat", {
                                  name: "admin",
                                  whatsAppBusinessAccountId:
                                    whatsAppBusinessAccountId,
                                  chatId: from,
                                  message:
                                    filteredNodeEdges[0].data.text[0].content,
                                  timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                })
                                .then((response) => {
                                  // Handle the response from your server
                                  // console.log("Message saved:", response.data);
                                })
                                .catch((error) => {
                                  // Handle any errors
                                  console.error("Error:", error);
                                });
                            })

                            .catch((err) => {
                              console.log("Error", err);
                            });
                        });
                    } else {
                      let filteredNodeTextArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return element.type == "text";
                        });

                      let filteredNodeButtonArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return (
                            element.type !== "text" && element.type !== "button"
                          );
                        });

                      let filteredNodeReplyBtnArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return (
                            element.type !== "text" && element.type !== "list"
                          );
                        });

                      // console.log(
                      //   "Reply Array",
                      //   filteredNodeReplyBtnArray,
                      //   "List array",
                      //   filteredNodeButtonArray
                      // );

                      let newArray = filteredNodeButtonArray.map((item) => ({
                        id: item.id + item.nodeId,
                        title: item.content,
                        description: "",
                      }));

                      let newButtonArray = filteredNodeReplyBtnArray.map(
                        (item) => ({
                          type: "reply",
                          reply: {
                            id: item.id + item.nodeId,
                            title: item.content,
                          },
                        })
                      );

                      if (filteredNodeButtonArray.length > 0) {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                          )
                          .then((res) => {
                            // console.log(res.data, "admin data");
                            const adityaToken = res.data[0].accesToken;

                            axios({
                              method: "POST",
                              url:
                                "https://graph.facebook.com/v17.0/" +
                                phone_number_id +
                                "/messages?access_token=" +
                                adityaToken,
                              data: {
                                messaging_product: "whatsapp",
                                to: from,
                                type: "interactive",
                                interactive: {
                                  type: "list",
                                  body: {
                                    text: filteredNodeTextArray[0].content,
                                  },
                                  action: {
                                    button: "Please Select",
                                    sections: [
                                      {
                                        rows: newArray,
                                      },
                                    ],
                                  },
                                },
                              },
                              headers: { "Content-Type": "application/json" },
                            })
                              .then((res) => {
                                // console.log("Response",res)

                                axios
                                  .post("https://tudoorg.glitch.me/api/chat", {
                                    name: "admin",
                                    whatsAppBusinessAccountId:
                                      whatsAppBusinessAccountId,
                                    chatId: from,
                                    message: filteredNodeTextArray[0].content,
                                    timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                  })
                                  .then((response) => {
                                    // Handle the response from your server
                                    // console.log("Message saved:", response.data);
                                  })
                                  .catch((error) => {
                                    // Handle any errors
                                    console.error("Error:", error);
                                  });
                              })

                              .catch((err) => {
                                console.log("Error", err);
                              });
                          });
                      } else {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                          )
                          .then((res) => {
                            // console.log(res.data, "admin data");
                            const adityaToken = res.data[0].accesToken;

                            axios({
                              method: "POST",
                              url:
                                "https://graph.facebook.com/v17.0/" +
                                phone_number_id +
                                "/messages?access_token=" +
                                adityaToken,
                              data: {
                                messaging_product: "whatsapp",
                                to: from,
                                type: "interactive",
                                interactive: {
                                  type: "button",
                                  body: {
                                    text: filteredNodeTextArray[0].content,
                                  },
                                  action: {
                                    buttons: newButtonArray,
                                  },
                                },
                              },
                              headers: { "Content-Type": "application/json" },
                            })
                              .then((res) => {
                                // console.log("Response",res)

                                axios
                                  .post("https://tudoorg.glitch.me/api/chat", {
                                    name: "admin",
                                    whatsAppBusinessAccountId:
                                      whatsAppBusinessAccountId,
                                    chatId: from,
                                    message: filteredNodeTextArray[0].content,
                                    timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                  })
                                  .then((response) => {
                                    // Handle the response from your server
                                    // console.log("Message saved:", response.data);
                                  })
                                  .catch((error) => {
                                    // Handle any errors
                                    console.error("Error:", error);
                                  });
                              })

                              .catch((err) => {
                                console.log("Error", err);
                              });
                          });
                      }
                    }
                  }
                  
                  else if(text.dynamicList && text.dynamicList == "true"){
                    
                    
                    
                    
                    console.log("This is dynamic Data")
                    
                    console.log(node,"Node")
                    console.log(text,"This is text")


                    
                    const selectedDynamicId = selectedOptionId.split("-")[1]


                    if(text.nodeId == selectedDynamicId){


                      const filteredEdges = res.data[0].edges.filter((el) => {
                        return (
                          text.nodeId == el.source &&
                          text.sourceHandle == el.sourceHandle
                        );
                      });

  
                      const filteredNodeEdges = res.data[0].nodes.filter((el) => {
                        return filteredEdges[0]?.target == el.id;
                      });


                      console.log()



                    }
                    
              
                    
                    const selectedDynamicOption = dynamicListMsg && dynamicListMsg.filter((el) => {
                      return el == selectedOption
                    })
                    
                    // console.log(selectedDynamicOption, "selectedDynamicOption")
                    
                    if(selectedDynamicOption && selectedDynamicOption.length > 0) {
                        
                        const filteredEdges = res.data[0].edges.filter((el) => {
                      return (
                        text.nodeId == el.source &&
                        text.sourceHandle == el.sourceHandle
                      );
                    });
                      
                      console.log(filteredEdges,"Matching Edges")

                   

                    const filteredNodeEdges = res.data[0].nodes.filter((el) => {
                      return filteredEdges[0]?.target == el.id;
                    });
                      
                      console.log(filteredNodeEdges,"filteredNodeEdges.................")
                      
                      
                               const dynamicEdges = res.data[0].edges.filter((el) => {
                                    return (
                                      filteredNodeEdges[0].data.text[0].nodeId == el.source 
                                    );
                                  });

                                  console.log(dynamicEdges,"Filtered Edges")


                                  const dynamicNode = res.data[0].nodes.filter((el) => {
                                    return (
                                      dynamicEdges[0].target == el.id 
                                    );
                                  });
                      
                      console.log(dynamicNode,"*#$)^*$#%^$)&$*")
                      
                      
                      if(filteredNodeEdges.length > 0 && filteredNodeEdges[0].data && filteredNodeEdges[0].data.name == "Webhook Node"){
                        
                        console.log("Inside Webhook node with params",filteredNodeEdges[0].data.apiType)
                        
                        if(dynamicNode[0].data.apiType == "post"){
                            axios.post(filteredNodeEdges[0].data.text[0].content,
                                {
                                  name:"Aditya",
                                  phone:"823092894894",
                                  email:"aditya@jdhj.com"
                                }
                            )
                          .then((res) => {
                              console.log(res)
                            })
                          .catch((err) => {
                              console.log(err)
                            })
                        }
                        
                        
                        else{
                          
                          axios.get(filteredNodeEdges[0].data.text[0].content)
                        .then((res) => {
                          console.log(res.data,"kerjf89ri")
                          
                          const result = res.data && res.data.data.find(item => item.studioName === selectedOption);

                          console.log(result, "..............Result..............");
                          
                          
                          const hasKey = filteredNodeEdges[0].data.getParams[0] in result;
                          if(hasKey){
                            const idValue = result[filteredNodeEdges[0].data.getParams[0]];
                            
                            axios.get(`${filteredNodeEdges[0].data.text[0].content}?${filteredNodeEdges[0].data.getParams[0]}=${idValue}`)
                            .then((res) => {
                                console.log(res.data,"jrewmfierjhnerjtgui9o")
                              
                              
                              
                              const HandleExtractData = () => {
                                      // if (Object.keys(apiResponse).length === 0) {
                                      //   console.log('API response is empty. Make sure to fetch the response first.');
                                      //   return;
                                      // }

                                      try {
                                        // const data = JSONPath({ path: node.data.fetchedData, json:response.data });
                                        // console.log("Extracted Data:", data);
                                        filteredNodeEdges[0].data.customFields.forEach((customFieldItem, index) => {
                                        const { jsonPath, variable } = customFieldItem;

                                        if (!jsonPath) {
                                          console.error('JSONPath is empty for custom field at index', index);
                                          return;
                                        }
                                          
                                          console.log(jsonPath)

                                        const data = JSONPath({ path: jsonPath, json: res.data});
                                          
                                        console.log(data,"Data Json Path.......")
                                          
                                          
                                          if(data.length > 0){
                                            
                                            dynamicListMsg = data
                                            
                                            let newArray = data.map(
                                            (item,id) => ({
                                              id: id,
                                              title: item,
                                              description: "",
                                            })
                                          );
                                        
                                        axios.get(`https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`)
                                        .then((res) => {
                                          const adityaToken = res.data[0].accesToken;
                                          
                                          
                                          axios({
                                      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                                      url:
                                        "https://graph.facebook.com/v17.0/" +
                                        phone_number_id +
                                        "/messages?access_token=" +
                                        adityaToken,
                                      data: {
                                        messaging_product: "whatsapp",
                                        to: from,
                                        type: "interactive",
                                      interactive: {
                                        type: "list",
                                        body: {
                                          text: dynamicNode[0].data.text[0].content,
                                        },
                                        action: {
                                          button: "Please Select",
                                          sections: [
                                            {
                                              rows: newArray,
                                            },
                                          ],
                                        },
                                      },
                                      },
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                    })
                                    .then((res) => {
                                        console.log(res)
                                      })
                                    .catch((err) => {
                                          console.log(err)
                                        })
                                          
                                          
                                        })
                                        .catch((err) => {
                                          console.log(err)
                                        })
                                            
                                          }
                                        
                                           
                                        
                                        
                                       }); 
                                        
                                      } catch (error) {
                                        console.error("Error extracting data:", error.message);
                                      }
                                    };
                              
                                  HandleExtractData()  
                              
                              
                              
                              
                              
                              
                            })
                            .catch((err) => {
                              console.log(err)
                            })
                          }
                          
                          
                          
                        })
                        .catch((err) => {
                          console.log(err)
                        })
                          
                        }
                        
                        
                        
                        
                      }
                    
                    
                    else if (
                      filteredNodeEdges.length > 0 &&
                      filteredNodeEdges[0].data.text.length == 1 && filteredNodeEdges[0].data  && !filteredNodeEdges[0].data.getParams && filteredNodeEdges[0].data.name !== "Webhook Node"
                    ) {
                      axios
                        .get(
                          `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                        )
                        .then((res) => {
                          // console.log(res.data, "admin data");
                        console.log('yes i am')
                          const adityaToken = res.data[0].accesToken;

                          axios({
                            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                            url:
                              "https://graph.facebook.com/v17.0/" +
                              phone_number_id +
                              "/messages?access_token=" +
                              adityaToken,
                            data: {
                              messaging_product: "whatsapp",
                              to: from,
                              type: "text",
                              text: {
                                body: filteredNodeEdges[0].data.text[0].content,
                              },
                            },
                            headers: {
                              "Content-Type": "application/json",
                            },
                          })
                            .then((res) => {
                              // console.log("Response",res)

                              axios
                                .post("https://tudoorg.glitch.me/api/chat", {
                                  name: "admin",
                                  whatsAppBusinessAccountId:
                                    whatsAppBusinessAccountId,
                                  chatId: from,
                                  message:
                                    filteredNodeEdges[0].data.text[0].content,
                                  timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                })
                                .then((response) => {
                                  // Handle the response from your server
                                  // console.log("Message saved:", response.data);
                                })
                                .catch((error) => {
                                  // Handle any errors
                                  console.error("Error:", error);
                                });
                            })

                            .catch((err) => {
                              console.log("Error", err);
                            });
                        });
                    } else if (filteredNodeEdges.length > 0 &&
                      filteredNodeEdges[0].data.text.length > 1 && filteredNodeEdges[0].data  && !filteredNodeEdges[0].data.getParams && filteredNodeEdges[0].data.name !== "Webhook Node"
                               
                              ) {
                      
                      let filteredNodeTextArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return element.type == "text";
                        });

                      let filteredNodeButtonArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return (
                            element.type !== "text" && element.type !== "button"
                          );
                        });

                      let filteredNodeReplyBtnArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return (
                            element.type !== "text" && element.type !== "list"
                          );
                        });

                      // console.log(
                      //   "Reply Array",
                      //   filteredNodeReplyBtnArray,
                      //   "List array",
                      //   filteredNodeButtonArray
                      // );

                      let newArray = filteredNodeButtonArray.map((item) => ({
                        id: item.id + item.nodeId,
                        title: item.content,
                        description: "",
                      }));

                      let newButtonArray = filteredNodeReplyBtnArray.map(
                        (item) => ({
                          type: "reply",
                          reply: {
                            id: item.id + item.nodeId,
                            title: item.content,
                          },
                        })
                      );

                      if (filteredNodeButtonArray.length > 0) {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                          )
                          .then((res) => {
                            // console.log(res.data, "admin data");
                            const adityaToken = res.data[0].accesToken;

                            axios({
                              method: "POST",
                              url:
                                "https://graph.facebook.com/v17.0/" +
                                phone_number_id +
                                "/messages?access_token=" +
                                adityaToken,
                              data: {
                                messaging_product: "whatsapp",
                                to: from,
                                type: "interactive",
                                interactive: {
                                  type: "list",
                                  body: {
                                    text: filteredNodeTextArray[0].content,
                                  },
                                  action: {
                                    button: "Please Select",
                                    sections: [
                                      {
                                        rows: newArray,
                                      },
                                    ],
                                  },
                                },
                              },
                              headers: { "Content-Type": "application/json" },
                            })
                              .then((res) => {
                                // console.log("Response",res)

                                axios
                                  .post("https://tudoorg.glitch.me/api/chat", {
                                    name: "admin",
                                    whatsAppBusinessAccountId:
                                      whatsAppBusinessAccountId,
                                    chatId: from,
                                    message: filteredNodeTextArray[0].content,
                                    timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                  })
                                  .then((response) => {
                                    // Handle the response from your server
                                    // console.log("Message saved:", response.data);
                                  })
                                  .catch((error) => {
                                    // Handle any errors
                                    console.error("Error:", error);
                                  });
                              })

                              .catch((err) => {
                                console.log("Error", err);
                              });
                          });
                      } else {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                          )
                          .then((res) => {
                            // console.log(res.data, "admin data");
                            const adityaToken = res.data[0].accesToken;

                            axios({
                              method: "POST",
                              url:
                                "https://graph.facebook.com/v17.0/" +
                                phone_number_id +
                                "/messages?access_token=" +
                                adityaToken,
                              data: {
                                messaging_product: "whatsapp",
                                to: from,
                                type: "interactive",
                                interactive: {
                                  type: "button",
                                  body: {
                                    text: filteredNodeTextArray[0].content,
                                  },
                                  action: {
                                    buttons: newButtonArray,
                                  },
                                },
                              },
                              headers: { "Content-Type": "application/json" },
                            })
                              .then((res) => {
                                // console.log("Response",res)

                                axios
                                  .post("https://tudoorg.glitch.me/api/chat", {
                                    name: "admin",
                                    whatsAppBusinessAccountId:
                                      whatsAppBusinessAccountId,
                                    chatId: from,
                                    message: filteredNodeTextArray[0].content,
                                    timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                  })
                                  .then((response) => {
                                    // Handle the response from your server
                                    // console.log("Message saved:", response.data);
                                  })
                                  .catch((error) => {
                                    // Handle any errors
                                    console.error("Error:", error);
                                  });
                              })

                              .catch((err) => {
                                console.log("Error", err);
                              });
                          });
                      }
                    }
                      
                  }
                    
                  }
                  
                  
                });
              }
            });
            // console.log("conversation flow", res.data[0].edges);
          });
      }
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  });

  // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
  app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = "aditya123";

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
        console.log(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
});



// $.data[?(@.docId == 'emirates')].*.[*].time
