const express = require("express");
var cors = require("cors");
const body_parser = require("body-parser");
const axios = require("axios").default;
const queryString = require("qs");
const app = express().use(body_parser.json()); // creates express http server
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JSONPath } = require("jsonpath-plus");
const { check, validationResult } = require("express-validator");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");
var http = require("http");
// const { Server } = require("socket.io");
const server = http.createServer(app);
const nodemailer = require("nodemailer");
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

// const uri = `mongodb+srv://technet-server:57cioPlRjZB1EmZu@parental-control.blsirns.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://aditya2test:N0DX5uUKuYZmGuF4@cluster0.mgkp1lm.mongodb.net/`;
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
let dynamicListMsg = [];
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
  const FlowList = db.collection("FlowList");

  // Define a schema for the recipients collection
  const recipientSchema = new mongoose.Schema({
    email: String,
    opened: Boolean,
    lastseen: Date,
  });

  // Create a model based on the schema
  const Recipients = mongoose.model(
    "Recipients",
    recipientSchema,
    "recipients"
  );

  // Nodemailer transporter setup
  const transporter = nodemailer.createTransport({
    /* Your nodemailer transporter configuration here */
    service: "gmail",
    auth: {
      user: "pradhantestay@gmail.com",
      pass: "tathkjmyrfgwwxdf",
    },
  });

  app.post("/sendmail", async (req, res) => {
    try {
      const { Recipient, MessageBody, Subject } = req.body;

      const Server = `https://tudoorg.glitch.me/recipients/${Recipient}`;

      const htmlBody = `<p>${MessageBody}</p><img src="${Server}" style="display:none">`;

      const mailOptions = {
        from: "pradhantestay@gmail.com",
        to: Recipient,
        subject: Subject,
        html: htmlBody,
      };

      await transporter.sendMail(mailOptions);

      // Insert recipient into MongoDB using Mongoose
      // Create new recipient document using Mongoose
      const newRecipient = new Recipients({
        email: Recipient,
        opened: false,
        lastseen: null,
      });
      await newRecipient.save();

      console.log("Email sent and recipient inserted into MongoDB");
      res.send({ status: "success" });
    } catch (error) {
      console.error("An error occurred:", error);
      res
        .status(500)
        .send({
          error:
            "An error occurred while sending the email or inserting the recipient",
        });
    }
  });

  app.get("/recipients/:recipient", async (req, res) => {
    try {
      const recipientEmail = req.params.recipient;
      const date_ob = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Update recipient in MongoDB using Mongoose
      const result = await Recipients.updateOne(
        { email: recipientEmail },
        { $set: { opened: true, lastseen: date_ob } }
      );

      console.log("Recipient updated in MongoDB");
      res.send({ status: "success", time: date_ob });
    } catch (error) {
      console.error("An error occurred:", error);
      res
        .status(500)
        .send({
          error:
            "An error occurred while updating the recipient in the database",
        });
    }
  });

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

  app.post("/api/chatFlow", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      const data = req.body;
      // console.log(JSON.parse(data) ,"data")
      // Create a new chat message document
      const result = await ChatFlows.insertOne(req.body);

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });

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

  app.post("/api/flowList/", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // console.log(req.body);
      const { whatsAppBusinessAccountId } = req.query;
      const data = req.body;
      // console.log(data);

      const existingCustomer = await FlowList.findOne({
        whatsAppBusinessAccountId: whatsAppBusinessAccountId,
      });

      if (!existingCustomer) {
        // If the customer doesn't exist, insert a new record
        // const result = await FlowList.insertOne(req.body);
        // res.status(200).json(result); // Respond with the saved message

        const result = await FlowList.insertOne({
          whatsAppBusinessAccountId: whatsAppBusinessAccountId,
          ...data,
        });
        return res.status(200).json(result); // Respond with the saved message
      } else {
        console.log("Else========");
        // If the customer exists, update the existing record
        const result = await FlowList.insertOne({
          whatsAppBusinessAccountId: whatsAppBusinessAccountId,
          ...data,
        });

        res.status(200).json(result); // Respond with the updated message
      }

      // console.log(existingCustomer);

      // Create a new chat message document
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
    }
  });

  app.get("/api/flowList", async (req, res) => {
    try {
      // Assuming your request body contains sender and content
      // Create a new chat message document
      const whatsAppBusinessAccountId = req.query.whatsAppBusinessAccountId;
      const result = await FlowList.find({
        whatsAppBusinessAccountId: whatsAppBusinessAccountId,
      }).toArray();

      res.status(200).json(result); //rsnd with the saved message
    } catch (error) {
      res.status(500).json({ error: "Failed to save the message." });
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
      console.log(req.body, "Body");
      console.log(req.body.entry[0].messaging, "Body");
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
        let globalVar = { email: "" };

        // console.log(user);

        let selectedOption;
        let selectedOptionId;

        console.log(
          req.body.entry[0].changes[0].value.messages[0],
          "9845093486043956840998650"
        );

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
        console.log(
          msg_body,
          "This is the response message from user.............."
        );
        console.log("selectedOptionId", selectedOptionId);
        console.log("selectedOption", selectedOption);

        // io.emit("message", {
        //   message:
        //     msg_body ||
        //     req.body.entry[0].changes[0].value.messages[0].interactive
        //       .list_reply,
        //   name: user,
        //   number: from,
        // });

        axios
          .get(
            `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
          )
          .then((res) => {
            // console.log(res.data,"All Customers")

            let filteredArray = res.data.filter((obj) => obj.number == from);

            console.log(filteredArray[0].customField, "Specific user");

            if (
              filteredArray[0].customField &&
              filteredArray[0].customField.length > 0
            ) {
              //                         let keys = Object.keys(filteredArray[0].customField);

              //                       Check if there are any keys in the array
              //                       if (keys.length > 0) {

              //                          let firstKey = keys[0];

              //                         if(filteredArray[0].customField[firstKey] === ""){

              //                           filteredArray[0].customField[firstKey] = msg_body; // Set the value for the first key

              //                           Customers.update(
              //                            { "number": from }, // Specify the query criteria to find the document with the phone number
              //                            {
              //                               $set: {
              //                                  ["customField." + firstKey]: msg_body// Add the customField object with an email field
              //                               }
              //                            }
              //                           )

              //                           }

              //                       }

              // Assuming you want to target the last element of the customField array
              const lastElementIndex = filteredArray[0].customField.length - 1;
              const lastElement =
                filteredArray[0].customField[lastElementIndex];

              console.log(lastElement, "Last Element-----------------");

              let keys = Object.keys(lastElement);
              console.log(keys, "Keys Element-----------------");

              // Check if there are any keys in the last element of the array
              if (keys.length > 0) {
                let firstKey = keys[0];

                console.log("Inide If of first key", firstKey);

                if (lastElement[firstKey] === "") {
                  // const encryptedString = cryptr.encrypt(msg_body);

                  lastElement[firstKey] = msg_body || selectedOption; // Set the value for the first key of the last element

                  console.log(
                    "Inide second If of first key",
                    lastElement[firstKey]
                  );

                  // Update the last element of the customField array in the MongoDB document
                  Customers.updateOne(
                    { number: from }, // Specify the query criteria to find the document with the phone number
                    {
                      $set: {
                        ["customField." + lastElementIndex]: lastElement, // Update the last element of the customField array
                      },
                    }
                  );

                  axios
                    .get(
                      `https://tudoorg.glitch.me/api/chatFlow?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
                    )
                    .then((res) => {
                      let Edges;
                      let Nodes;

                      const nodeIdValue = lastElement["nodeId"];

                      console.log(nodeIdValue, "Value of node id");

                      Edges = res.data[0].edges;
                      Nodes = res.data[0].nodes;

                      const filteredEdge = res.data[0].edges.filter((el) => {
                        // console.log(el,"Filtered Edge")
                        return nodeIdValue == el.source;
                      });

                      console.log(filteredEdge, "user input filtered edge");

                      const filteredNode = res.data[0].nodes.filter((el) => {
                        // console.log(el,"Element")
                        return filteredEdge[0].target == el.id;
                      });

                      console.log(filteredNode, "user input filtered edge");

                      if (filteredNode[0].data.name == "User Input Node") {
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
                                  body: filteredNode[0].data.text[0].content,
                                },
                              },
                              headers: {
                                "Content-Type": "application/json",
                              },
                            })
                              .then((res) => {
                                var a = filteredNode[0].data.text[1].content;
                                const nodeId = filteredNode[0].id;

                                // console.log("emailData",node.data.text[1].content)
                                // globalVar = {[a]: ""}
                                // console.log(globalVar, "This is global var.........")

                                //   Customers.update(
                                //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                //    {
                                //       $set: {
                                //          ["customField." + a]: "" // Add the customField object with an email field
                                //       }
                                //    }
                                // )

                                //   Customers.update(
                                //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                //    {
                                //       $push: {
                                //          "customField": { $each: [ { [a]: "", nodeId:filteredNode[0].id } ] } // Add an object to the customField array with a dynamic key
                                //       }
                                //    }
                                // )

                                Customers.update(
                                  { number: from }, // Specify the query criteria to find the document with the phone number
                                  {
                                    $addToSet: {
                                      customField: {
                                        [a]: "",
                                        nodeId: filteredNode[0].id,
                                      }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                    },
                                  }
                                );

                                //       Customers.update(
                                //   { "number": from, "customField": { $not: { $elemMatch: { [a]: { $exists: true } } } } }, // Check if no element with key [a] exists
                                //   {
                                //     $push: { "customField": { [a]: "", "nodeId": filteredNode[0].id } } // Add an empty item with key [a] and nodeId
                                //   },
                                //   { upsert: true } // Specify the upsert option to insert a new document if no document matches the query
                                // );

                                // // Step 1: Remove existing [a] field
                                // Customers.update(
                                //   { "number": from, "customField": { $elemMatch: { [a]: { $exists: true } } } },
                                //   { $pull: { "customField": { [a]: { $exists: true } } } }
                                // );

                                // // Step 2: Add new [a] and nodeId fields, and create customField array if it doesn't exist
                                // Customers.update(
                                //   { "number": from },
                                //   {
                                //     $push: {
                                //       "customField": {
                                //         $each: [{ [a]: "", "nodeId": filteredNode[0].id }],
                                //         $position: 0
                                //       }
                                //     }
                                //   },
                                //   { upsert: true }
                                // );

                                axios
                                  .post("https://tudoorg.glitch.me/api/chat", {
                                    name: "admin",
                                    whatsAppBusinessAccountId:
                                      whatsAppBusinessAccountId,
                                    chatId: from,
                                    message:
                                      filteredNode[0].data.text[0].content,
                                    timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                  })
                                  .then((response) => {
                                    console.log(msg_body, "mongo");

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
                      } else if (filteredNode[0].data.name == "Webhook Node") {
                        if (filteredNode[0].data.apiType == "post") {
                          const headers = filteredNode[0].data.headerObj;
                          const bodyType = filteredNode[0].data.bodyType;

                          if (
                            filteredNode[0].data.customFields &&
                            filteredNode[0].data.customFields.length > 0
                          ) {
                            var key =
                              filteredNode[0].data.customFields[0].variable;

                            Customers.update(
                              { number: from }, // Specify the query criteria to find the document with the phone number
                              {
                                $addToSet: {
                                  customField: {
                                    [key]: "",
                                    nodeId: filteredNode[0].id,
                                  }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                },
                              }
                            );
                          }

                          axios
                            .get(
                              `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
                            )
                            .then((res) => {
                              // console.log(res.data)

                              const filteredCustomer = res.data.filter((el) => {
                                return el.number == from;
                              });

                              console.log(
                                filteredCustomer,
                                "Filterred Customer--------------------------"
                              );

                              const result = {};

                              // Iterate over the params array
                              // for (let i = 0; i < filteredNode[0].data.postParams.length; i++) {
                              //     const paramKey = filteredNode[0].data.postParams[i].key;
                              //     // Check if the customField array has a property with the same name as the current param key
                              //     if (filteredCustomer[0].customField.some(obj => obj.hasOwnProperty(paramKey))) {
                              //         // Add the key-value pair to the result object
                              //         result[paramKey] = filteredCustomer[0].customField.find(obj => obj.hasOwnProperty(paramKey))[paramKey];
                              //     }
                              // }

                              for (
                                let i = 0;
                                i < filteredNode[0].data.postParams.length;
                                i++
                              ) {
                                const paramKey =
                                  filteredNode[0].data.postParams[i].key;
                                // Check if the customField array has a property with the same name as the current param key
                                if (
                                  filteredCustomer[0].customField.some((obj) =>
                                    obj.hasOwnProperty(paramKey)
                                  )
                                ) {
                                  // Add the key-value pair to the result object without space after colon
                                  result[paramKey] =
                                    filteredCustomer[0].customField.find(
                                      (obj) => obj.hasOwnProperty(paramKey)
                                    )[paramKey];
                                }
                              }

                              console.log(
                                result,
                                "body for post api------------------"
                              );

                              axios
                                .post(
                                  filteredNode[0].data.text[0].content,
                                  bodyType == "queryString"
                                    ? queryString.stringify(result)
                                    : result,
                                  headers && {
                                    headers: headers,
                                  }
                                )
                                .then((res) => {
                                  let responseCustomField;

                                  console.log(
                                    res.data,
                                    "Post response-------------------"
                                  );

                                  if (
                                    filteredNode[0].data.customFields &&
                                    filteredNode[0].data.customFields.length > 0
                                  ) {
                                    const HandleExtractData = () => {
                                      filteredNode[0].data.customFields.forEach(
                                        (customFieldItem, index) => {
                                          const { jsonPath, variable } =
                                            customFieldItem;

                                          if (!jsonPath) {
                                            // console.error('JSONPath is empty for custom field at index', index);
                                            return;
                                          }

                                          responseCustomField = JSONPath({
                                            path: jsonPath,
                                            json: res.data,
                                          });

                                          console.log(
                                            responseCustomField,
                                            "Data Json Path......."
                                          );

                                          var varia = variable;

                                          console.log(
                                            varia,
                                            "This is variable============="
                                          );

                                          //   Customers.update(
                                          //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                          //    {
                                          //       $push: {
                                          //          "customField": { $each: [ { [a]: responseCustomField[0], nodeId:filteredNode[0].id } ] } // Add an object to the customField array with a dynamic key
                                          //       }
                                          //    }
                                          // )

                                          Customers.updateOne(
                                            {
                                              number: from,
                                              customField: {
                                                $elemMatch: {
                                                  [varia]: { $exists: true },
                                                },
                                              },
                                            }, // Check if an object with key [a] exists
                                            {
                                              $set: {
                                                "customField.$[elem].responseCustomField":
                                                  responseCustomField[0],
                                                "customField.$[elem].nodeId":
                                                  filteredNode[0].id,
                                              }, // Update the responseCustomField and nodeId fields of the matching object
                                            },
                                            {
                                              arrayFilters: [
                                                {
                                                  "elem.$[varia]": {
                                                    $exists: true,
                                                  },
                                                },
                                              ],
                                            },
                                            (err, result) => {
                                              if (err) {
                                                console.error("Error:", err);
                                              } else {
                                                console.log(
                                                  "Update result:",
                                                  result
                                                );
                                              }
                                            }
                                          );

                                          console.log("After updateOne");
                                        }
                                      );
                                    };

                                    HandleExtractData();
                                  }

                                  const filteredEdgePart2 = Edges.filter(
                                    (el) => {
                                      // console.log(el,"Filtered Edge")
                                      return filteredNode[0].id == el.source;
                                    }
                                  );

                                  console.log(
                                    filteredEdgePart2,
                                    "user input filtered edge"
                                  );

                                  const filteredNodePart2 = Nodes.filter(
                                    (el) => {
                                      // console.log(el,"Element")
                                      return (
                                        filteredEdgePart2[0].target == el.id
                                      );
                                    }
                                  );

                                  if (
                                    filteredNodePart2[0].data.name ==
                                    "Webhook Node"
                                  ) {
                                    if (
                                      filteredNodePart2[0].data.apiType ==
                                      "post"
                                    ) {
                                      console.log("hwiuebebwievb");
                                    }
                                  } else if (
                                    filteredNodePart2[0].data.name ==
                                    "User Input Node"
                                  ) {
                                    axios
                                      .get(
                                        `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                      )
                                      .then((res) => {
                                        // console.log(res.data, "admin data");
                                        const adityaToken =
                                          res.data[0].accesToken;

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
                                              body: filteredNodePart2[0].data
                                                .text[0].content,
                                            },
                                          },
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                        })
                                          .then((res) => {
                                            var a =
                                              filteredNodePart2[0].data.text[1]
                                                .content;
                                            const nodeId =
                                              filteredNodePart2[0].id;

                                            //   Customers.update(
                                            //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                            //    {
                                            //       $push: {
                                            //          "customField": { $each: [ { [a]: "", nodeId:filteredNode[0].id } ] } // Add an object to the customField array with a dynamic key
                                            //       }
                                            //    }
                                            // )

                                            Customers.update(
                                              { number: from }, // Specify the query criteria to find the document with the phone number
                                              {
                                                $addToSet: {
                                                  customField: {
                                                    [a]: "",
                                                    nodeId: filteredNode[0].id,
                                                  }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                                },
                                              }
                                            );

                                            //   Customers.update(
                                            //   { "number": from, "customField": { $not: { $elemMatch: { [a]: { $exists: true } } } } }, // Check if no element with key [a] exists
                                            //   {
                                            //     $push: { "customField": { [a]: "", "nodeId": filteredNode[0].id } } // Add an empty item with key [a] and nodeId
                                            //   },
                                            //   { upsert: true } // Specify the upsert option to insert a new document if no document matches the query
                                            // );

                                            // // Step 1: Remove existing [a] field
                                            // Customers.update(
                                            //   { "number": from, "customField": { $elemMatch: { [a]: { $exists: true } } } },
                                            //   { $pull: { "customField": { [a]: { $exists: true } } } }
                                            // );

                                            // // Step 2: Add new [a] and nodeId fields, and create customField array if it doesn't exist
                                            // Customers.update(
                                            //   { "number": from },
                                            //   {
                                            //     $push: {
                                            //       "customField": {
                                            //         $each: [{ [a]: "", "nodeId": filteredNode[0].id }],
                                            //         $position: 0
                                            //       }
                                            //     }
                                            //   },
                                            //   { upsert: true }
                                            // );

                                            axios
                                              .post(
                                                "https://tudoorg.glitch.me/api/chat",
                                                {
                                                  name: "admin",
                                                  whatsAppBusinessAccountId:
                                                    whatsAppBusinessAccountId,
                                                  chatId: from,
                                                  message:
                                                    filteredNodePart2[0].data
                                                      .text[0].content,
                                                  timestamp:
                                                    timestamp.toISOString(), // Convert the Date object to an ISO string
                                                }
                                              )
                                              .then((response) => {
                                                console.log(msg_body, "mongo");

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
                                  } else if (
                                    filteredNodePart2[0].data.name == "{Node}"
                                  ) {
                                    console.log(
                                      "================================This is indide Normal Node========================"
                                    );

                                    if (
                                      filteredNodePart2[0].data.text.length == 1
                                    ) {
                                      // if(responseCustomField && responseCustomField.length > 1){

                                      //                                     const containsPlaceholder = /\${.*?}/.test(text);

                                      //                                     if(containsPlaceholder){

                                      //                                     }
                                      //                                     else{

                                      // }

                                      console.log(
                                        responseCustomField[0],
                                        "Response "
                                      );

                                      let text =
                                        filteredNodePart2[0].data.text[0]
                                          .content;
                                      let replacedText = text.replace(
                                        /\${(.*?)}/g,
                                        responseCustomField[0].toString()
                                      );

                                      console.log(
                                        JSON.stringify(replacedText),
                                        "=============================Image Ljnk--------------------"
                                      );

                                      axios
                                        .get(
                                          `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                        )
                                        .then((res) => {
                                          // console.log(res.data, "admin data");
                                          const adityaToken =
                                            res.data[0].accesToken;

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
                                                body: JSON.stringify(
                                                  replacedText
                                                ),
                                              },
                                            },
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                          })
                                            .then((res) => {
                                              console.log(
                                                "Response Image lwneofiwe====================================",
                                                res.data
                                              );

                                              axios
                                                .post(
                                                  "https://tudoorg.glitch.me/api/chat",
                                                  {
                                                    name: "admin",
                                                    whatsAppBusinessAccountId:
                                                      whatsAppBusinessAccountId,
                                                    chatId: from,
                                                    message: replacedText,
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
                                                  console.error(
                                                    "Error:",
                                                    error
                                                  );
                                                });
                                            })

                                            .catch((err) => {
                                              console.log("Error", err);
                                            });
                                        });

                                      // }

                                      //                                   else {

                                      //                                     console.log("This is the condition................")

                                      //                                   axios
                                      //                                   .get(
                                      //                                     `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                      //                                   )
                                      //                                   .then((res) => {
                                      //                                     // console.log(res.data, "admin data");
                                      //                                     const adityaToken = res.data[0].accesToken;

                                      //                                     axios({
                                      //                                       method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                                      //                                       url:
                                      //                                         "https://graph.facebook.com/v17.0/" +
                                      //                                         phone_number_id +
                                      //                                         "/messages?access_token=" +
                                      //                                         adityaToken,
                                      //                                       data: {
                                      //                                         messaging_product: "whatsapp",
                                      //                                         to: from,
                                      //                                         type: "text",
                                      //                                         text: {
                                      //                                           body:  filteredNodePart2[0].data.text[0].content,
                                      //                                         },
                                      //                                       },
                                      //                                       headers: {
                                      //                                         "Content-Type": "application/json",
                                      //                                       },
                                      //                                     })
                                      //                                       .then((res) => {
                                      //                                         // console.log("Response",res)

                                      //                                         axios
                                      //                                           .post(
                                      //                                             "https://tudoorg.glitch.me/api/chat",
                                      //                                             {
                                      //                                               name: "admin",
                                      //                                               whatsAppBusinessAccountId:
                                      //                                                 whatsAppBusinessAccountId,
                                      //                                               chatId: from,
                                      //                                               message: filteredNodePart2[0].data.text[0].content,
                                      //                                               timestamp:
                                      //                                                 timestamp.toISOString(), // Convert the Date object to an ISO string
                                      //                                             }
                                      //                                           )
                                      //                                           .then((response) => {
                                      //                                             // Handle the response from your server
                                      //                                             // console.log("Message saved:", response.data);
                                      //                                           })
                                      //                                           .catch((error) => {
                                      //                                             // Handle any errors
                                      //                                             console.error("Error:", error);
                                      //                                           });
                                      //                                       })

                                      //                                       .catch((err) => {
                                      //                                         console.log("Error", err);
                                      //                                       });
                                      //                                   });

                                      //                                   }
                                    } else if (
                                      filteredNodePart2[0].data.text.length > 1
                                    ) {
                                      const userResponseVariable =
                                        filteredNodePart2[0].data.text.find(
                                          (item) =>
                                            item.type === "userResponseVariable"
                                        );

                                      // Access the content property of the userResponseVariable
                                      if (userResponseVariable) {
                                        const a = userResponseVariable.content;
                                        console.log(
                                          userResponseVariable.content
                                        );
                                        Customers.update(
                                          { number: from }, // Specify the query criteria to find the document with the phone number
                                          {
                                            $addToSet: {
                                              customField: {
                                                [a]: "",
                                                nodeId: filteredNodePart2[0].id,
                                              }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                            },
                                          }
                                        );
                                      }

                                      let filteredNodeButtonArray =
                                        filteredNodePart2[0].data.text.filter(
                                          function (element) {
                                            return element.type == "list";
                                          }
                                        );

                                      let newArray =
                                        filteredNodeButtonArray.map((item) => ({
                                          id: item.id + item.nodeId,
                                          title: item.content,
                                          description: "",
                                        }));

                                      axios
                                        .get(
                                          `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                        )
                                        .then((res) => {
                                          // console.log(res.data, "admin data");
                                          const adityaToken =
                                            res.data[0].accesToken;
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
                                                  text: filteredNodePart2[0]
                                                    .data.text[0].content,
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
                                              "Content-Type":
                                                "application/json",
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
                                                    message:
                                                      filteredNodePart2[0].data
                                                        .text[0].content,
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
                                                  console.error(
                                                    "Error:",
                                                    error
                                                  );
                                                });
                                            })

                                            .catch((err) => {
                                              console.log("Error", err);
                                            });
                                        });
                                    }
                                  }
                                })
                                .catch((err) => {
                                  console.log(err);
                                });
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        } else {
                        }
                      }
                      //                           else if(){

                      //                           }
                    })
                    .catch((err) => {});
                }
              }
            }
          })
          .catch((err) => {
            console.log(err);
          });

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
            if (Object.keys(globalVar).length > 0) {
              console.log("before if", globalVar);
              globalVar.email = msg_body;
              console.log("inside if", globalVar);
            }
            console.log("outsude if", globalVar);
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

            let Edges = res.data[0].edges;
            let Nodes = res.data[0].nodes;

            res.data[0].nodes.map((node) => {
              // console.log(node.data.text, "content", msg_body, "msgBody");
              // console.log("msg body", msg_body);
              // console.log(node.data.name, "is it http?");

              // if (node.data.name = "Http Node") {
              //   console.log("HTTP NODE DATA")
              //   // node.data.text.map((text) => {
              //   //   axios.get(`${text.content}`).then((res) => {
              //   //     console.log(res, "fetchDAta");
              //   //   })
              //   //   .catch((err)=>{
              //   //     console.log(err)
              //   //   });
              //   // });
              // }

              // console.log("Length of node", node.data.text.length)

              //==========================Checking Node text length===========================//
              if (node.data.text) {
                // console.log("i am coming", node.data.name);

                // console.log("Node Length")
                node.data.text.map((text) => {
                  // console.log(text.content,"Text Content", msg_body, "Response Message")

                  if (text.content == msg_body && text.type == "text") {
                    console.log(text.nodeId, "============id===============");

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
                          // console.log(node, "9094j340934n9i9")

                          // console.log("HTTP LINK", node.data.text)

                          // console.log("HTTP LINK Content", node.data.text[0].content)

                          //===============If the next node is webhook node====================//
                          if (node.data.name == "Webhook Node") {
                            // console.log("yes i am http");

                            //                             const filteredEdges = res.data[0].edges.filter((el) => {
                            //                               // console.log(el,"Filtered Edge")
                            //                               return (
                            //                                 node.data.text[0].nodeId == el.source
                            //                               );
                            //                             });

                            //                             console.log(filteredEdges,"Filtered Edges")

                            //                             const filteredNode = res.data[0].nodes.filter((el) => {
                            //                               // console.log(el,"Element")
                            //                               return (
                            //                                 filteredEdges[0].target == el.id
                            //                               );
                            //                             });

                            //                             console.log(filteredNode,"filtered Node")

                            //                             console.log(filteredNode, "Filtered Node")

                            //                             let dynamicList = filteredNode[0].data.text.filter((el) => {
                            //                               return el.type !== "text"
                            //                             })

                            //                             console.log(dynamicList, "Dynamic list")

                            //                             let newArray = dynamicList[0].dynamicList.map(
                            //                               (item,id) => ({
                            //                                 id: id,
                            //                                 title: item,
                            //                                 description: "",
                            //                               })
                            //                             );

                            //                             const PostData = {
                            //                               messaging_product: "whatsapp",
                            //                                 to: from,
                            //                                 type: "text",
                            //                                 text: {
                            //                                   body: filteredNode[0].data.text[0].dynamicContent.length > 0 ? filteredNode[0].data.text[0].dynamicContent :   filteredNode[0].data.text[0].content,
                            //                                 },
                            //                             }

                            //                             const InteractivePostData = {

                            //                                       messaging_product: "whatsapp",
                            //                                       to: from,
                            //                                       type: "interactive",
                            //                                       interactive: {
                            //                                         type: "list",
                            //                                         body: {
                            //                                           text: filteredNode[0].data.text[0].dynamicContent.length > 0 ? filteredNode[0].data.text[0].dynamicContent :   filteredNode[0].data.text[0].content,
                            //                                         },
                            //                                         action: {
                            //                                           button: "Please Select",
                            //                                           sections: [
                            //                                             {
                            //                                               rows: newArray,
                            //                                             },
                            //                                           ],
                            //                                         },
                            //                                       },

                            //                             }

                            //                            axios
                            //                                   .get(
                            //                                     `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                            //                                   )
                            //                                   .then((res) => {
                            //                                     // console.log(res.data, "admin data");
                            //                                     const adityaToken = res.data[0].accesToken;

                            //                                     axios({
                            //                                       method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                            //                                       url:
                            //                                         "https://graph.facebook.com/v17.0/" +
                            //                                         phone_number_id +
                            //                                         "/messages?access_token=" +
                            //                                         adityaToken,
                            //                                       data: filteredNode[0].data.text.length > 1 ? InteractivePostData : PostData,
                            //                                       headers: {
                            //                                         "Content-Type": "application/json",
                            //                                       },
                            //                                     })
                            //                                       .then((res) => {
                            //                                         // console.log("Response",res)

                            //                                         axios
                            //                                           .post(
                            //                                             "https://tudoorg.glitch.me/api/chat",
                            //                                             {
                            //                                               name: "admin",
                            //                                               whatsAppBusinessAccountId:
                            //                                                 whatsAppBusinessAccountId,
                            //                                               chatId: from,
                            //                                               message: filteredNode[0].data.text[0].dynamicContent.length > 0 ? filteredNode[0].data.text[0].dynamicContent :   filteredNode[0].data.text[0].content,
                            //                                               timestamp:
                            //                                                 timestamp.toISOString(), // Convert the Date object to an ISO string
                            //                                             }
                            //                                           )
                            //                                           .then((response) => {
                            //                                             // Handle the response from your server
                            //                                             // console.log("Message saved:", response.data);
                            //                                           })
                            //                                           .catch((error) => {
                            //                                             // Handle any errors
                            //                                             console.error("Error:", error);
                            //                                           });
                            //                                       })

                            //                                       .catch((err) => {
                            //                                         console.log("Error", err);
                            //                                       });
                            //                                   });

                            axios
                              .get(`${node.data.text[0].content}`)
                              .then((response) => {
                                // console.log("Status Code...........",response.status)
                                console.log("res", response.data);

                                const filteredEdges = res.data[0].edges.filter(
                                  (el) => {
                                    // console.log(el,"Filtered Edge")
                                    return (
                                      node.data.text[0].nodeId == el.source
                                    );
                                  }
                                );

                                // console.log(filteredEdges,"Filtered Edges")

                                const filteredNode = res.data[0].nodes.filter(
                                  (el) => {
                                    // console.log(el,"Element")
                                    return filteredEdges[0].target == el.id;
                                  }
                                );

                                console.log(filteredNode, "filtered Node");

                                const HandleExtractData = () => {
                                  // if (Object.keys(apiResponse).length === 0) {
                                  //   console.log('API response is empty. Make sure to fetch the response first.');
                                  //   return;
                                  // }

                                  try {
                                    // const data = JSONPath({ path: node.data.fetchedData, json:response.data });
                                    // console.log("Extracted Data:", data);
                                    node.data.customFields.forEach(
                                      (customFieldItem, index) => {
                                        const { jsonPath, variable } =
                                          customFieldItem;

                                        if (!jsonPath) {
                                          // console.error('JSONPath is empty for custom field at index', index);
                                          return;
                                        }

                                        const data = JSONPath({
                                          path: jsonPath,
                                          json: response.data,
                                        });

                                        console.log(
                                          data,
                                          "Data Json Path......."
                                        );

                                        if (data && data.length > 1) {
                                          dynamicListMsg = data;

                                          let newArray = data.map(
                                            (item, id) => ({
                                              id:
                                                `handle${id}-` +
                                                filteredNode[0].id,
                                              title: item,
                                              description: "",
                                            })
                                          );

                                          axios
                                            .get(
                                              `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                            )
                                            .then((res) => {
                                              const adityaToken =
                                                res.data[0].accesToken;

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
                                                      text: filteredNode[0].data
                                                        .text[0].content,
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
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                              })
                                                .then((res) => {
                                                  console.log(res);
                                                })
                                                .catch((err) => {
                                                  console.log(err);
                                                });
                                            })
                                            .catch((err) => {
                                              console.log(err);
                                            });
                                        } else if (data && data.length == 1) {
                                          let text =
                                            filteredNode[0].data.text[0]
                                              .content;
                                          let replacedText = text.replace(
                                            /\${(.*?)}/g,
                                            data[0]
                                          );

                                          axios
                                            .get(
                                              `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                            )
                                            .then((res) => {
                                              // console.log(res.data, "admin data");
                                              const adityaToken =
                                                res.data[0].accesToken;

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
                                                  type: "image",
                                                  image: {
                                                    link: replacedText,
                                                  },
                                                },
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
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
                                                        message: replacedText,
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
                                                      console.error(
                                                        "Error:",
                                                        error
                                                      );
                                                    });
                                                })

                                                .catch((err) => {
                                                  console.log("Error", err);
                                                });
                                            });
                                        }
                                      }
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error extracting data:",
                                      error.message
                                    );
                                  }
                                };

                                HandleExtractData();
                              })
                              .catch((err) => {
                                console.log(err);
                              });

                            //                             axios
                            //                                   .get(
                            //                                     `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                            //                                   )
                            //                                   .then((res) => {
                            //                                     // console.log(res.data, "admin data");
                            //                                     const adityaToken = res.data[0].accesToken;

                            //                                 axios
                            //                               .get(`${node.data.text[0].content}`)
                            //                               .then((res) => {

                            //                                     axios({
                            //                                       method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                            //                                       url:
                            //                                         "https://graph.facebook.com/v17.0/" +
                            //                                         phone_number_id +
                            //                                         "/messages?access_token=" +
                            //                                         adityaToken,
                            //                                       data: {
                            //                                         messaging_product: "whatsapp",
                            //                                         to: from,
                            //                                         type: "text",
                            //                                         text: {
                            //                                           body: res.data.body,
                            //                                         },
                            //                                       },
                            //                                       headers: {
                            //                                         "Content-Type": "application/json",
                            //                                       },
                            //                                     })
                            //                                       .then((res) => {
                            //                                         // console.log("Response",res)

                            //                                         axios
                            //                                           .post(
                            //                                             "https://tudoorg.glitch.me/api/chat",
                            //                                             {
                            //                                               name: "admin",
                            //                                               whatsAppBusinessAccountId:
                            //                                                 whatsAppBusinessAccountId,
                            //                                               chatId: from,
                            //                                               message: res.data.body,
                            //                                               timestamp:
                            //                                                 timestamp.toISOString(), // Convert the Date object to an ISO string
                            //                                             }
                            //                                           )
                            //                                           .then((response) => {
                            //                                             // Handle the response from your server
                            //                                             // console.log("Message saved:", response.data);
                            //                                           })
                            //                                           .catch((error) => {
                            //                                             // Handle any errors
                            //                                             console.error("Error:", error);
                            //                                           });
                            //                                       })

                            //                                       .catch((err) => {
                            //                                         console.log("Error", err);
                            //                                       });

                            //                               })
                            //                               .catch((err) => {
                            //                                 console.log(err);
                            //                               });

                            //                             })
                          } else if (
                            (node.data.text.length == 1 &&
                              node.data.name !== "Webhook Node") ||
                            (node.data.text.length == 1 &&
                              node.data.name !== "User Input Node")
                          ) {
                            console.log("This is a text message");

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
                                          body:
                                            text.dynamicContent &&
                                            text.dynamicContent.length > 0
                                              ? text.dynamicContent
                                              : text.content,
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
                          } else if (
                            node.data.text.length > 1 &&
                            node.data.name !== "Webhook Node" &&
                            node.data.text.length > 1 &&
                            node.data.name !== "User Input Node"
                          ) {
                            console.log("This is a Interactive Message");

                            const userResponseVariable = node.data.text.find(
                              (item) => item.type === "userResponseVariable"
                            );

                            // Access the content property of the userResponseVariable
                            if (userResponseVariable) {
                              const a = userResponseVariable.content;
                              console.log(userResponseVariable.content);
                              Customers.update(
                                { number: from }, // Specify the query criteria to find the document with the phone number
                                {
                                  $addToSet: {
                                    customField: { [a]: "", nodeId: node.id }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                  },
                                }
                              );
                            }

                            // console.log(node);

                            let filteredNodeTextArray = node.data.text.filter(
                              function (element) {
                                return element.type == "text";
                              }
                            );

                            let filteredNodeButtonArray = node.data.text.filter(
                              function (element) {
                                return element.type == "list";
                              }
                            );

                            let filteredNodeReplyButtonArray =
                              node.data.text.filter(function (element) {
                                return element.type == "button";
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
                          } else if (
                            node.data.text.length > 1 &&
                            node.data.name == "User Input Node"
                          ) {
                            console.log(node.id, "This is the user input node");

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
                                      body: node.data.text[0].content,
                                    },
                                  },
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                })
                                  .then((res) => {
                                    var a = node.data.text[1].content;
                                    const nodeId = node.data.id;

                                    // console.log("emailData",node.data.text[1].content)
                                    // globalVar = {[a]: ""}
                                    // console.log(globalVar, "This is global var.........")

                                    //   Customers.update(
                                    //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                    //    {
                                    //       $set: {
                                    //          ["customField." + a]: "" // Add the customField object with an email field
                                    //       }
                                    //    }
                                    // )

                                    Customers.update(
                                      { number: from }, // Specify the query criteria to find the document with the phone number
                                      {
                                        $addToSet: {
                                          customField: {
                                            [a]: "",
                                            nodeId: node.id,
                                          }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                        },
                                      }
                                    );

                                    //   Customers.update(
                                    //   { "number": from, "customField": { $not: { $elemMatch: { [a]: { $exists: true } } } } }, // Check if no element with key [a] exists
                                    //   {
                                    //     $push: { "customField": { [a]: "", "nodeId": node.id } } // Add an empty item with key [a] and nodeId
                                    //   },
                                    //   { upsert: true } // Specify the upsert option to insert a new document if no document matches the query
                                    // );

                                    //             // Step 1: Remove existing [a] field
                                    // Customers.update(
                                    //   { "number": from, "customField": { $elemMatch: { [a]: { $exists: true } } } },
                                    //   { $pull: { "customField": { [a]: { $exists: true } } } }
                                    // );

                                    // // Step 2: Add new [a] and nodeId fields, and create customField array if it doesn't exist
                                    // Customers.update(
                                    //   { "number": from },
                                    //   {
                                    //     $push: {
                                    //       "customField": {
                                    //         $each: [{ [a]: "", "nodeId": node.id }],
                                    //         $position: 0
                                    //       }
                                    //     }
                                    //   },
                                    //   { upsert: true }
                                    // );

                                    //                    Customers.updateOne(
                                    //     { "number": from, "customField.nodeId": nodeId },
                                    //     {
                                    //         $set: {
                                    //             ["customField.$[elem]." + a]: "",
                                    //         },
                                    //         $addToSet: {
                                    //             "customField": { $each: [{ [a]: "", nodeId }] }
                                    //         }
                                    //     },
                                    //     {
                                    //         arrayFilters: [{ "elem.nodeId": nodeId }]
                                    //     },
                                    //     (err, result) => {
                                    //         if (err) {
                                    //             console.error(err);
                                    //         } else {
                                    //             console.log("Document updated successfully");
                                    //         }
                                    //     }
                                    // );

                                    axios
                                      .post(
                                        "https://tudoorg.glitch.me/api/chat",
                                        {
                                          name: "admin",
                                          whatsAppBusinessAccountId:
                                            whatsAppBusinessAccountId,
                                          chatId: from,
                                          message: node.data.text[0].content,
                                          timestamp: timestamp.toISOString(), // Convert the Date object to an ISO string
                                        }
                                      )
                                      .then((response) => {
                                        console.log(msg_body, "mongo");

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
                      }
                    });
                  } else if (
                    text.content == selectedOption &&
                    text.id + text.nodeId == selectedOptionId &&
                    !text.dynamicList
                  ) {
                    // console.log("TEXT", text.content);
                    // console.log(text.sourceHandle, "SourceHandleid");
                    // console.log(
                    //   text.nodeId,
                    //   "Node Id",
                    //   text.sourceHandle,
                    //   "Source Handle Node"
                    // );

                    // console.log("this is  a selectedOption")

                    const filteredEdges = res.data[0].edges.filter((el) => {
                      return (
                        text.nodeId == el.source &&
                        text.sourceHandle == el.sourceHandle
                      );
                    });

                    console.log("filteredEdges", filteredEdges);

                    const filteredNodeEdges = res.data[0].nodes.filter((el) => {
                      return filteredEdges[0]?.target == el.id;
                    });

                    console.log(
                      "filteredNodeEdges======================================",
                      filteredNodeEdges
                    );

                    console.log("FilteredEdges", filteredEdges);

                    if (filteredNodeEdges[0].data.name == "Webhook Node") {
                      if (filteredNodeEdges[0].data.apiType == "post") {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
                          )
                          .then((res) => {
                            const filteredCustomer = res.data.filter((el) => {
                              return el.number == from;
                            });

                            let headers = filteredNodeEdges[0].data.headerObj;
                            const bodyType = filteredNodeEdges[0].data.bodyType;

                            const objectWithAccessToken =
                              filteredCustomer[0].customField.find((obj) =>
                                obj.hasOwnProperty("access_token")
                              );

                            let text = headers.Authorization;
                            let replacedText = text.replace(
                              /\${(.*?)}/g,
                              objectWithAccessToken.access_token
                            );

                            headers.Authorization = replacedText;

                            console.log(replacedText);

                            axios
                              .get(
                                `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
                              )
                              .then((res) => {
                                // console.log(res.data)

                                const filteredCustomer = res.data.filter(
                                  (el) => {
                                    return el.number == from;
                                  }
                                );

                                console.log(
                                  filteredCustomer,
                                  "Filterred Customer--------------------------"
                                );

                                const result = {};

                                // Iterate over the params array
                                for (
                                  let i = 0;
                                  i <
                                  filteredNodeEdges[0].data.postParams.length;
                                  i++
                                ) {
                                  const paramKey =
                                    filteredNodeEdges[0].data.postParams[i].key;
                                  // Check if the customField array has a property with the same name as the current param key
                                  if (
                                    filteredCustomer[0].customField.some(
                                      (obj) => obj.hasOwnProperty(paramKey)
                                    )
                                  ) {
                                    // Add the key-value pair to the result object
                                    result[paramKey] =
                                      filteredCustomer[0].customField.find(
                                        (obj) => obj.hasOwnProperty(paramKey)
                                      )[paramKey];
                                  }
                                }

                                console.log(
                                  result,
                                  "body for post api------------------"
                                );

                                axios
                                  .post(
                                    filteredNodeEdges[0].data.text[0].content,
                                    bodyType == "queryString"
                                      ? queryString.stringify(result)
                                      : result,
                                    headers && {
                                      headers: headers,
                                    }
                                  )
                                  .then((res) => {
                                    let responseCustomField;

                                    console.log(
                                      res.data,
                                      "Post response-------------------"
                                    );

                                    if (
                                      filteredNodeEdges[0].data.customFields &&
                                      filteredNodeEdges[0].data.customFields
                                        .length > 0
                                    ) {
                                      const HandleExtractData = () => {
                                        filteredNodeEdges[0].data.customFields.forEach(
                                          (customFieldItem, index) => {
                                            const { jsonPath, variable } =
                                              customFieldItem;

                                            if (!jsonPath) {
                                              // console.error('JSONPath is empty for custom field at index', index);
                                              return;
                                            }

                                            responseCustomField = JSONPath({
                                              path: jsonPath,
                                              json: res.data,
                                            });

                                            console.log(
                                              responseCustomField,
                                              "Data Json Path......."
                                            );

                                            var a = variable;

                                            // Customers.update(
                                            //   { number: from }, // Specify the query criteria to find the document with the phone number
                                            //   {
                                            //     $push: {
                                            //       customField: {
                                            //         $each: [
                                            //           {
                                            //             [a]: responseCustomField[0],
                                            //             nodeId:
                                            //               filteredNodeEdges[0]
                                            //                 .id,
                                            //           },
                                            //         ],
                                            //       }, // Add an object to the customField array with a dynamic key
                                            //     },
                                            //   }
                                            // );

                                            //                                             Customers.update(
                                            //                                              { "number": from }, // Specify the query criteria to find the document with the phone number
                                            //                                              {
                                            //                                                 $addToSet: {
                                            //                                                    "customField": { [a]: responseCustomField[0], nodeId: filteredNodeEdges[0].id } // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                            //                                                 }
                                            //                                              }
                                            //                                           )

                                            Customers.update(
                                              {
                                                number: from,
                                                customField: {
                                                  $elemMatch: {
                                                    [a]: { $exists: true },
                                                  },
                                                },
                                              }, // Check if an object with key [a] exists
                                              {
                                                $set: {
                                                  "customField.$[elem].responseCustomField":
                                                    responseCustomField[0],
                                                  "customField.$[elem].nodeId":
                                                    filteredNodeEdges[0].id,
                                                }, // Update the responseCustomField and nodeId fields of the matching object
                                              },
                                              {
                                                arrayFilters: [
                                                  {
                                                    "elem.[a]": {
                                                      $exists: true,
                                                    },
                                                  },
                                                ],
                                              } // Specify the array filter to match the element with key [a]
                                            );
                                          }
                                        );
                                      };

                                      HandleExtractData();
                                    }

                                    const filteredEdgePart2 = Edges.filter(
                                      (el) => {
                                        // console.log(el,"Filtered Edge")
                                        return (
                                          filteredNodeEdges[0].id == el.source
                                        );
                                      }
                                    );

                                    console.log(
                                      filteredEdgePart2,
                                      "user input filtered edge"
                                    );

                                    const filteredNodePart2 = Nodes.filter(
                                      (el) => {
                                        // console.log(el,"Element")
                                        return (
                                          filteredEdgePart2[0].target == el.id
                                        );
                                      }
                                    );

                                    if (
                                      filteredNodePart2[0].data.name ==
                                      "Webhook Node"
                                    ) {
                                      if (
                                        filteredNodePart2[0].data.apiType ==
                                        "post"
                                      ) {
                                        console.log("hwiuebebwievb");
                                      }
                                    } else if (
                                      filteredNodePart2[0].data.name ==
                                      "User Input Node"
                                    ) {
                                      axios
                                        .get(
                                          `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                        )
                                        .then((res) => {
                                          // console.log(res.data, "admin data");
                                          const adityaToken =
                                            res.data[0].accesToken;

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
                                                body: filteredNodePart2[0].data
                                                  .text[0].content,
                                              },
                                            },
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                          })
                                            .then((res) => {
                                              var a =
                                                filteredNodePart2[0].data
                                                  .text[1].content;
                                              const nodeId =
                                                filteredNodePart2[0].id;

                                              // Customers.update(
                                              //   { number: from }, // Specify the query criteria to find the document with the phone number
                                              //   {
                                              //     $push: {
                                              //       customField: {
                                              //         $each: [
                                              //           {
                                              //             [a]: "",
                                              //             nodeId:
                                              //               filteredNodeEdges[0]
                                              //                 .id,
                                              //           },
                                              //         ],
                                              //       }, // Add an object to the customField array with a dynamic key
                                              //     },
                                              //   }
                                              // );

                                              Customers.update(
                                                { number: from }, // Specify the query criteria to find the document with the phone number
                                                {
                                                  $addToSet: {
                                                    customField: {
                                                      [a]: "",
                                                      nodeId: node.id,
                                                    }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                                  },
                                                }
                                              );

                                              //    Customers.update(
                                              //   { "number": from, "customField": { $not: { $elemMatch: { [a]: { $exists: true } } } } }, // Check if no element with key [a] exists
                                              //   {
                                              //     $push: { "customField": { [a]: "", "nodeId": node.id } } // Add an empty item with key [a] and nodeId
                                              //   },
                                              //   { upsert: true } // Specify the upsert option to insert a new document if no document matches the query

                                              // );

                                              // // Step 1: Remove existing [a] field
                                              // Customers.update(
                                              //   { "number": from, "customField": { $elemMatch: { [a]: { $exists: true } } } },
                                              //   { $pull: { "customField": { [a]: { $exists: true } } } }
                                              // );

                                              // // Step 2: Add new [a] and nodeId fields, and create customField array if it doesn't exist
                                              // Customers.update(
                                              //   { "number": from },
                                              //   {
                                              //     $push: {
                                              //       "customField": {
                                              //         $each: [{ [a]: "", "nodeId": node.id }],
                                              //         $position: 0
                                              //       }
                                              //     }
                                              //   },
                                              //   { upsert: true }
                                              // );

                                              axios
                                                .post(
                                                  "https://tudoorg.glitch.me/api/chat",
                                                  {
                                                    name: "admin",
                                                    whatsAppBusinessAccountId:
                                                      whatsAppBusinessAccountId,
                                                    chatId: from,
                                                    message:
                                                      filteredNodePart2[0].data
                                                        .text[0].content,
                                                    timestamp:
                                                      timestamp.toISOString(), // Convert the Date object to an ISO string
                                                  }
                                                )
                                                .then((response) => {
                                                  console.log(
                                                    msg_body,
                                                    "mongo"
                                                  );

                                                  // Handle the response from your server
                                                  // console.log("Message saved:", response.data);
                                                })
                                                .catch((error) => {
                                                  // Handle any errors
                                                  console.error(
                                                    "Error:",
                                                    error
                                                  );
                                                });
                                            })

                                            .catch((err) => {
                                              console.log("Error", err);
                                            });
                                        });
                                    } else if (
                                      filteredNodePart2[0].data.name == "{Node}"
                                    ) {
                                      if (
                                        filteredNodePart2[0].data.text.length ==
                                        1
                                      ) {
                                        // if(responseCustomField && responseCustomField.length > 1){

                                        console.log(
                                          responseCustomField[0],
                                          "=================This is object==============="
                                        );

                                        let text =
                                          filteredNodePart2[0].data.text[0]
                                            .content;

                                        let replacedText = text.replace(
                                          /\${(.*?)}/g,
                                          `"${JSON.stringify(
                                            responseCustomField[0],
                                            null,
                                            2
                                          )}"`
                                        );

                                        console.log(
                                          replacedText,
                                          "==========================Image 738457398--------------------"
                                        );

                                        axios
                                          .get(
                                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                          )
                                          .then((res) => {
                                            // console.log(res.data, "admin data");
                                            const adityaToken =
                                              res.data[0].accesToken;

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
                                                  body: replacedText,
                                                },
                                              },
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                            })
                                              .then((res) => {
                                                console.log(
                                                  "Response Image lwneofiwe====================================",
                                                  res.data
                                                );

                                                axios
                                                  .post(
                                                    "https://tudoorg.glitch.me/api/chat",
                                                    {
                                                      name: "admin",
                                                      whatsAppBusinessAccountId:
                                                        whatsAppBusinessAccountId,
                                                      chatId: from,
                                                      message: replacedText,
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
                                                    console.error(
                                                      "Error:",
                                                      error
                                                    );
                                                  });
                                              })

                                              .catch((err) => {
                                                console.log("Error", err);
                                              });
                                          });

                                        // }

                                        //                                   else {

                                        //                                     console.log("This is the condition................")

                                        //                                   axios
                                        //                                   .get(
                                        //                                     `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                        //                                   )
                                        //                                   .then((res) => {
                                        //                                     // console.log(res.data, "admin data");
                                        //                                     const adityaToken = res.data[0].accesToken;

                                        //                                     axios({
                                        //                                       method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                                        //                                       url:
                                        //                                         "https://graph.facebook.com/v17.0/" +
                                        //                                         phone_number_id +
                                        //                                         "/messages?access_token=" +
                                        //                                         adityaToken,
                                        //                                       data: {
                                        //                                         messaging_product: "whatsapp",
                                        //                                         to: from,
                                        //                                         type: "text",
                                        //                                         text: {
                                        //                                           body:  filteredNodePart2[0].data.text[0].content,
                                        //                                         },
                                        //                                       },
                                        //                                       headers: {
                                        //                                         "Content-Type": "application/json",
                                        //                                       },
                                        //                                     })
                                        //                                       .then((res) => {
                                        //                                         // console.log("Response",res)

                                        //                                         axios
                                        //                                           .post(
                                        //                                             "https://tudoorg.glitch.me/api/chat",
                                        //                                             {
                                        //                                               name: "admin",
                                        //                                               whatsAppBusinessAccountId:
                                        //                                                 whatsAppBusinessAccountId,
                                        //                                               chatId: from,
                                        //                                               message: filteredNodePart2[0].data.text[0].content,
                                        //                                               timestamp:
                                        //                                                 timestamp.toISOString(), // Convert the Date object to an ISO string
                                        //                                             }
                                        //                                           )
                                        //                                           .then((response) => {
                                        //                                             // Handle the response from your server
                                        //                                             // console.log("Message saved:", response.data);
                                        //                                           })
                                        //                                           .catch((error) => {
                                        //                                             // Handle any errors
                                        //                                             console.error("Error:", error);
                                        //                                           });
                                        //                                       })

                                        //                                       .catch((err) => {
                                        //                                         console.log("Error", err);
                                        //                                       });
                                        //                                   });

                                        //                                   }
                                      } else if (
                                        filteredNodePart2[0].data.text.length >
                                        1
                                      ) {
                                        let filteredNodeButtonArray =
                                          filteredNodePart2[0].data.text.filter(
                                            function (element) {
                                              return element.type == "list";
                                            }
                                          );

                                        let newArray =
                                          filteredNodeButtonArray.map(
                                            (item) => ({
                                              id: item.id + item.nodeId,
                                              title: item.content,
                                              description: "",
                                            })
                                          );

                                        axios
                                          .get(
                                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                          )
                                          .then((res) => {
                                            // console.log(res.data, "admin data");
                                            const adityaToken =
                                              res.data[0].accesToken;
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
                                                    text: filteredNodePart2[0]
                                                      .data.text[0].content,
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
                                                "Content-Type":
                                                  "application/json",
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
                                                      message:
                                                        filteredNodePart2[0]
                                                          .data.text[0].content,
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
                                                    console.error(
                                                      "Error:",
                                                      error
                                                    );
                                                  });
                                              })

                                              .catch((err) => {
                                                console.log("Error", err);
                                              });
                                          });
                                      }
                                    }
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                  });
                              })
                              .catch((err) => {
                                console.log(err);
                              });
                          })
                          .catch((err) => {});
                      } else {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
                          )
                          .then((res) => {
                            const filteredCustomer = res.data.filter((el) => {
                              return el.number == from;
                            });

                            let headers = filteredNodeEdges[0].data.headerObj;
                            const bodyType = filteredNodeEdges[0].data.bodyType;

                            const objectWithAccessToken =
                              filteredCustomer[0].customField.find((obj) =>
                                obj.hasOwnProperty("access_token")
                              );

                            let text = headers.Authorization;
                            let replacedText = text.replace(
                              /\${(.*?)}/g,
                              objectWithAccessToken.access_token
                            );

                            headers.Authorization = replacedText;

                            console.log(replacedText);

                            axios
                              .get(
                                `https://tudoorg.glitch.me/api/customer?whatsAppBusinessAccountId=${whatsAppBusinessAccountId}`
                              )
                              .then((res) => {
                                // console.log(res.data)

                                const filteredCustomer = res.data.filter(
                                  (el) => {
                                    return el.number == from;
                                  }
                                );

                                console.log(
                                  filteredCustomer,
                                  "Filterred Customer--------------------------"
                                );

                                // const result = {};

                                // Iterate over the params array
                                // for (
                                //   let i = 0;
                                //   i <
                                //   filteredNodeEdges[0].data.postParams.length;
                                //   i++
                                // ) {
                                //   const paramKey =
                                //     filteredNodeEdges[0].data.postParams[i].key;
                                //   // Check if the customField array has a property with the same name as the current param key
                                //   if (
                                //     filteredCustomer[0].customField.some(
                                //       (obj) => obj.hasOwnProperty(paramKey)
                                //     )
                                //   ) {
                                //     // Add the key-value pair to the result object
                                //     result[paramKey] =
                                //       filteredCustomer[0].customField.find(
                                //         (obj) => obj.hasOwnProperty(paramKey)
                                //       )[paramKey];
                                //   }
                                // }

                                // console.log(
                                //   result,
                                //   "body for post api------------------"
                                // );

                                axios
                                  .get(
                                    filteredNodeEdges[0].data.text[0].content,

                                    headers && {
                                      headers: headers,
                                    }
                                  )
                                  .then((res) => {
                                    let responseCustomField;

                                    console.log(
                                      res.data,
                                      "======================GET Response-------------------"
                                    );

                                    if (
                                      filteredNodeEdges[0].data.customFields &&
                                      filteredNodeEdges[0].data.customFields
                                        .length > 0
                                    ) {
                                      const HandleExtractData = () => {
                                        filteredNodeEdges[0].data.customFields.forEach(
                                          (customFieldItem, index) => {
                                            const { jsonPath, variable } =
                                              customFieldItem;

                                            if (!jsonPath) {
                                              // console.error('JSONPath is empty for custom field at index', index);
                                              return;
                                            }

                                            responseCustomField = JSONPath({
                                              path: jsonPath,
                                              json: res.data,
                                            });

                                            console.log(
                                              responseCustomField,
                                              "Data Json Path......."
                                            );

                                            var a = variable;

                                            // Customers.update(
                                            //   { number: from }, // Specify the query criteria to find the document with the phone number
                                            //   {
                                            //     $push: {
                                            //       customField: {
                                            //         $each: [
                                            //           {
                                            //             [a]: responseCustomField[0],
                                            //             nodeId:
                                            //               filteredNodeEdges[0]
                                            //                 .id,
                                            //           },
                                            //         ],
                                            //       }, // Add an object to the customField array with a dynamic key
                                            //     },
                                            //   }
                                            // );

                                            // Customers.update(
                                            //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                            //    {
                                            //       $addToSet: {
                                            //          "customField": { [a]: responseCustomField[0], nodeId: filteredNodeEdges[0].id } // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                            //       }
                                            //    }
                                            // )

                                            Customers.update(
                                              {
                                                number: from,
                                                customField: {
                                                  $elemMatch: {
                                                    [a]: { $exists: true },
                                                  },
                                                },
                                              }, // Check if an object with key [a] exists
                                              {
                                                $set: {
                                                  "customField.$[elem].responseCustomField":
                                                    responseCustomField[0],
                                                  "customField.$[elem].nodeId":
                                                    filteredNodeEdges[0].id,
                                                }, // Update the responseCustomField and nodeId fields of the matching object
                                              },
                                              {
                                                arrayFilters: [
                                                  {
                                                    "elem.[a]": {
                                                      $exists: true,
                                                    },
                                                  },
                                                ],
                                              } // Specify the array filter to match the element with key [a]
                                            );
                                          }
                                        );
                                      };

                                      HandleExtractData();
                                    }

                                    const filteredEdgePart2 = Edges.filter(
                                      (el) => {
                                        // console.log(el,"Filtered Edge")
                                        return (
                                          filteredNodeEdges[0].id == el.source
                                        );
                                      }
                                    );

                                    console.log(
                                      filteredEdgePart2,
                                      "user input filtered edge"
                                    );

                                    const filteredNodePart2 = Nodes.filter(
                                      (el) => {
                                        // console.log(el,"Element")
                                        return (
                                          filteredEdgePart2[0].target == el.id
                                        );
                                      }
                                    );

                                    if (
                                      filteredNodePart2[0].data.name ==
                                      "Webhook Node"
                                    ) {
                                      if (
                                        filteredNodePart2[0].data.apiType ==
                                        "post"
                                      ) {
                                        console.log("hwiuebebwievb");
                                      }
                                    } else if (
                                      filteredNodePart2[0].data.name ==
                                      "User Input Node"
                                    ) {
                                      axios
                                        .get(
                                          `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                        )
                                        .then((res) => {
                                          // console.log(res.data, "admin data");
                                          const adityaToken =
                                            res.data[0].accesToken;

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
                                                body: filteredNodePart2[0].data
                                                  .text[0].content,
                                              },
                                            },
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                          })
                                            .then((res) => {
                                              var a =
                                                filteredNodePart2[0].data
                                                  .text[1].content;
                                              const nodeId =
                                                filteredNodePart2[0].id;

                                              // Customers.update(
                                              //   { number: from }, // Specify the query criteria to find the document with the phone number
                                              //   {
                                              //     $push: {
                                              //       customField: {
                                              //         $each: [
                                              //           {
                                              //             [a]: "",
                                              //             nodeId:
                                              //               filteredNodeEdges[0]
                                              //                 .id,
                                              //           },
                                              //         ],
                                              //       }, // Add an object to the customField array with a dynamic key
                                              //     },
                                              //   }
                                              // );
                                              // Customers.update(
                                              //    { "number": from }, // Specify the query criteria to find the document with the phone number
                                              //    {
                                              //       $addToSet: {
                                              //          "customField": { [a]: responseCustomField[0], nodeId: filteredNodeEdges[0].id } // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                              //       }
                                              //    }
                                              // )

                                              Customers.update(
                                                {
                                                  number: from,
                                                  customField: {
                                                    $elemMatch: {
                                                      [a]: { $exists: true },
                                                    },
                                                  },
                                                }, // Check if an object with key [a] exists
                                                {
                                                  $set: {
                                                    "customField.$[elem].responseCustomField":
                                                      responseCustomField[0],
                                                    "customField.$[elem].nodeId":
                                                      filteredNodeEdges[0].id,
                                                  }, // Update the responseCustomField and nodeId fields of the matching object
                                                },
                                                {
                                                  arrayFilters: [
                                                    {
                                                      "elem.[a]": {
                                                        $exists: true,
                                                      },
                                                    },
                                                  ],
                                                } // Specify the array filter to match the element with key [a]
                                              );

                                              axios
                                                .post(
                                                  "https://tudoorg.glitch.me/api/chat",
                                                  {
                                                    name: "admin",
                                                    whatsAppBusinessAccountId:
                                                      whatsAppBusinessAccountId,
                                                    chatId: from,
                                                    message:
                                                      filteredNodePart2[0].data
                                                        .text[0].content,
                                                    timestamp:
                                                      timestamp.toISOString(), // Convert the Date object to an ISO string
                                                  }
                                                )
                                                .then((response) => {
                                                  console.log(
                                                    msg_body,
                                                    "mongo"
                                                  );

                                                  // Handle the response from your server
                                                  // console.log("Message saved:", response.data);
                                                })
                                                .catch((error) => {
                                                  // Handle any errors
                                                  console.error(
                                                    "Error:",
                                                    error
                                                  );
                                                });
                                            })

                                            .catch((err) => {
                                              console.log("Error", err);
                                            });
                                        });
                                    } else if (
                                      filteredNodePart2[0].data.name == "{Node}"
                                    ) {
                                      if (
                                        filteredNodePart2[0].data.text.length ==
                                        1
                                      ) {
                                        // if(responseCustomField && responseCustomField.length > 1){

                                        console.log(
                                          responseCustomField[0],
                                          "=================This is object==============="
                                        );

                                        let text =
                                          filteredNodePart2[0].data.text[0]
                                            .content;

                                        let replacedText = text.replace(
                                          /\${(.*?)}/g,
                                          `"${JSON.stringify(
                                            responseCustomField[0],
                                            null,
                                            2
                                          )}"`
                                        );

                                        console.log(
                                          replacedText,
                                          "==========================Image 738457398--------------------"
                                        );

                                        axios
                                          .get(
                                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                          )
                                          .then((res) => {
                                            // console.log(res.data, "admin data");
                                            const adityaToken =
                                              res.data[0].accesToken;

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
                                                  body: replacedText,
                                                },
                                              },
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                            })
                                              .then((res) => {
                                                console.log(
                                                  "Response Image lwneofiwe====================================",
                                                  res.data
                                                );

                                                axios
                                                  .post(
                                                    "https://tudoorg.glitch.me/api/chat",
                                                    {
                                                      name: "admin",
                                                      whatsAppBusinessAccountId:
                                                        whatsAppBusinessAccountId,
                                                      chatId: from,
                                                      message: replacedText,
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
                                                    console.error(
                                                      "Error:",
                                                      error
                                                    );
                                                  });
                                              })

                                              .catch((err) => {
                                                console.log("Error", err);
                                              });
                                          });
                                      } else if (
                                        filteredNodePart2[0].data.text.length >
                                        1
                                      ) {
                                        let filteredNodeButtonArray =
                                          filteredNodePart2[0].data.text.filter(
                                            function (element) {
                                              return element.type == "list";
                                            }
                                          );

                                        let newArray =
                                          filteredNodeButtonArray.map(
                                            (item) => ({
                                              id: item.id + item.nodeId,
                                              title: item.content,
                                              description: "",
                                            })
                                          );

                                        axios
                                          .get(
                                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                          )
                                          .then((res) => {
                                            // console.log(res.data, "admin data");
                                            const adityaToken =
                                              res.data[0].accesToken;
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
                                                    text: filteredNodePart2[0]
                                                      .data.text[0].content,
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
                                                "Content-Type":
                                                  "application/json",
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
                                                      message:
                                                        filteredNodePart2[0]
                                                          .data.text[0].content,
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
                                                    console.error(
                                                      "Error:",
                                                      error
                                                    );
                                                  });
                                              })

                                              .catch((err) => {
                                                console.log("Error", err);
                                              });
                                          });
                                      }
                                    }
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                  });
                              })
                              .catch((err) => {
                                console.log(err);
                              });
                          })
                          .catch((err) => {});
                      }
                    } else if (
                      filteredNodeEdges.length > 0 &&
                      filteredNodeEdges[0].data.name == "{Node}" &&
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
                    } else if (
                      filteredNodeEdges.length > 0 &&
                      filteredNodeEdges[0].data.name == "{Node}" &&
                      filteredNodeEdges[0].data.text.length > 1
                    ) {
                      const userResponseVariable =
                        filteredNodeEdges[0].data.text.find(
                          (item) => item.type === "userResponseVariable"
                        );

                      // Access the content property of the userResponseVariable
                      if (userResponseVariable) {
                        const a = userResponseVariable.content;
                        console.log(userResponseVariable.content);
                        Customers.update(
                          { number: from }, // Specify the query criteria to find the document with the phone number
                          {
                            $addToSet: {
                              customField: {
                                [a]: "",
                                nodeId: filteredNodeEdges[0].id,
                              }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                            },
                          }
                        );
                      }

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
                          return element.type == "list";
                        });

                      let filteredNodeReplyBtnArray =
                        filteredNodeEdges[0].data.text.filter(function (
                          element
                        ) {
                          return element.type == "button";
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
                    } else if (
                      filteredNodeEdges[0].data.name == "User Input Node"
                    ) {
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
                                body: filteredNodeEdges[0].data.text[0].content,
                              },
                            },
                            headers: {
                              "Content-Type": "application/json",
                            },
                          })
                            .then((res) => {
                              var a = filteredNodeEdges[0].data.text[1].content;
                              const nodeId = filteredNodeEdges[0].id;

                              Customers.update(
                                { number: from }, // Specify the query criteria to find the document with the phone number
                                {
                                  $addToSet: {
                                    customField: {
                                      [a]: "",
                                      nodeId: filteredNodeEdges[0].id,
                                    }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                                  },
                                }
                              );

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
                                  console.log(msg_body, "mongo");

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
                  } else if (text.dynamicList && text.dynamicList == "true") {
                    console.log("This is dynamic Data");

                    console.log(node, "Node");
                    console.log(text, "This is text");

                    const selectedDynamicId = selectedOptionId.split("-")[1];
                    console.log(selectedDynamicId, "92urjd9384jdrh398");

                    if (text.nodeId == selectedDynamicId) {
                      const filteredEdges = res.data[0].edges.filter((el) => {
                        return (
                          text.nodeId == el.source &&
                          text.sourceHandle == el.sourceHandle
                        );
                      });

                      const filteredNodeEdges = res.data[0].nodes.filter(
                        (el) => {
                          return filteredEdges[0]?.target == el.id;
                        }
                      );

                      console.log(
                        filteredNodeEdges,
                        "Matching Nodes..............."
                      );

                      if (
                        filteredNodeEdges[0].data.name == "Webhook Node" &&
                        filteredNodeEdges[0].data.apiType == "post"
                      ) {
                        console.log(
                          filteredNodeEdges[0].data.postParams,
                          "8u948i34e...................."
                        );

                        // Convert array to object
                        let data = filteredNodeEdges[0].data.postParams.reduce(
                          (acc, cur) => {
                            acc[cur.key] = cur.value;
                            return acc;
                          },
                          {}
                        );

                        console.log(data, "Object wieh89e..................");

                        for (let key in data) {
                          if (data[key] === "user") {
                            data[key] = user;
                          } else if (data[key] === "from") {
                            data[key] = from;
                          }
                        }

                        console.log(data, "92r93j48934hj");

                        axios
                          .post(filteredNodeEdges[0].data.text[0].content, data)
                          .then((res) => {
                            console.log(res);
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      }
                    }

                    //                     console.log(text.dynamicList,"uhnedfiwu3efhw3iu", text.id, text.nodeId, text.content,"Text Content")

                    //                     console.log(text.id +  text.nodeId, "Node Id.......", selectedOptionId, "SelectedOptionId..........")

                    const selectedDynamicOption =
                      dynamicListMsg &&
                      dynamicListMsg.filter((el) => {
                        return el == selectedOption;
                      });

                    // console.log(selectedDynamicOption, "selectedDynamicOption")

                    if (
                      selectedDynamicOption &&
                      selectedDynamicOption.length > 0
                    ) {
                      const filteredEdges = res.data[0].edges.filter((el) => {
                        return (
                          text.nodeId == el.source &&
                          text.sourceHandle == el.sourceHandle
                        );
                      });

                      console.log(filteredEdges, "Matching Edges");

                      const filteredNodeEdges = res.data[0].nodes.filter(
                        (el) => {
                          return filteredEdges[0]?.target == el.id;
                        }
                      );

                      console.log(
                        filteredNodeEdges,
                        "filteredNodeEdges................."
                      );

                      const dynamicEdges = res.data[0].edges.filter((el) => {
                        return (
                          filteredNodeEdges[0].data.text[0].nodeId == el.source
                        );
                      });

                      console.log(dynamicEdges, "Filtered Edges");

                      const dynamicNode = res.data[0].nodes.filter((el) => {
                        return dynamicEdges[0].target == el.id;
                      });

                      console.log(dynamicNode, "*#$)^*$#%^$)&$*");

                      if (
                        filteredNodeEdges.length > 0 &&
                        filteredNodeEdges[0].data &&
                        filteredNodeEdges[0].data.name == "Webhook Node"
                      ) {
                        console.log(
                          "Inside Webhook node with params",
                          filteredNodeEdges[0].data.apiType
                        );

                        if (dynamicNode[0].data.apiType == "post") {
                          axios
                            .post(filteredNodeEdges[0].data.text[0].content, {
                              name: "Aditya",
                              phone: "823092894894",
                              email: "aditya@jdhj.com",
                            })
                            .then((res) => {
                              console.log(res);
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        } else {
                          axios
                            .get(filteredNodeEdges[0].data.text[0].content)
                            .then((res) => {
                              console.log(res.data, "kerjf89ri");

                              const result =
                                res.data &&
                                res.data.data.find(
                                  (item) => item.studioName === selectedOption
                                );

                              console.log(
                                result,
                                "..............Result.............."
                              );

                              const hasKey =
                                filteredNodeEdges[0].data.getParams[0] in
                                result;
                              if (hasKey) {
                                const idValue =
                                  result[
                                    filteredNodeEdges[0].data.getParams[0]
                                  ];

                                axios
                                  .get(
                                    `${filteredNodeEdges[0].data.text[0].content}?${filteredNodeEdges[0].data.getParams[0]}=${idValue}`
                                  )
                                  .then((res) => {
                                    console.log(
                                      res.data,
                                      "jrewmfierjhnerjtgui9o"
                                    );

                                    const HandleExtractData = () => {
                                      // if (Object.keys(apiResponse).length === 0) {
                                      //   console.log('API response is empty. Make sure to fetch the response first.');
                                      //   return;
                                      // }

                                      try {
                                        // const data = JSONPath({ path: node.data.fetchedData, json:response.data });
                                        // console.log("Extracted Data:", data);
                                        filteredNodeEdges[0].data.customFields.forEach(
                                          (customFieldItem, index) => {
                                            const { jsonPath, variable } =
                                              customFieldItem;

                                            if (!jsonPath) {
                                              console.error(
                                                "JSONPath is empty for custom field at index",
                                                index
                                              );
                                              return;
                                            }

                                            console.log(jsonPath);

                                            const data = JSONPath({
                                              path: jsonPath,
                                              json: res.data,
                                            });

                                            console.log(
                                              data,
                                              "Data Json Path......."
                                            );

                                            if (data.length > 0) {
                                              dynamicListMsg = data;

                                              let newArray = data.map(
                                                (item, id) => ({
                                                  id:
                                                    `handle${id}-` +
                                                    dynamicNode[0].id,
                                                  title: item,
                                                  description: "",
                                                })
                                              );

                                              axios
                                                .get(
                                                  `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                                                )
                                                .then((res) => {
                                                  const adityaToken =
                                                    res.data[0].accesToken;

                                                  axios({
                                                    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                                                    url:
                                                      "https://graph.facebook.com/v17.0/" +
                                                      phone_number_id +
                                                      "/messages?access_token=" +
                                                      adityaToken,
                                                    data: {
                                                      messaging_product:
                                                        "whatsapp",
                                                      to: from,
                                                      type: "interactive",
                                                      interactive: {
                                                        type: "list",
                                                        body: {
                                                          text: dynamicNode[0]
                                                            .data.text[0]
                                                            .content,
                                                        },
                                                        action: {
                                                          button:
                                                            "Please Select",
                                                          sections: [
                                                            {
                                                              rows: newArray,
                                                            },
                                                          ],
                                                        },
                                                      },
                                                    },
                                                    headers: {
                                                      "Content-Type":
                                                        "application/json",
                                                    },
                                                  })
                                                    .then((res) => {
                                                      console.log(res);
                                                    })
                                                    .catch((err) => {
                                                      console.log(err);
                                                    });
                                                })
                                                .catch((err) => {
                                                  console.log(err);
                                                });
                                            }
                                          }
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Error extracting data:",
                                          error.message
                                        );
                                      }
                                    };

                                    HandleExtractData();
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                  });
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        }
                      } else if (
                        filteredNodeEdges.length > 0 &&
                        filteredNodeEdges[0].data.text.length == 1 &&
                        filteredNodeEdges[0].data &&
                        !filteredNodeEdges[0].data.getParams &&
                        filteredNodeEdges[0].data.name !== "Webhook Node"
                      ) {
                        axios
                          .get(
                            `https://tudoorg.glitch.me/api/admin?PhoneNumberId=${phone_number_id}`
                          )
                          .then((res) => {
                            // console.log(res.data, "admin data");
                            console.log("yes i am");
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
                                  body: filteredNodeEdges[0].data.text[0]
                                    .content,
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
                      } else if (
                        filteredNodeEdges.length > 0 &&
                        filteredNodeEdges[0].data.text.length > 1 &&
                        filteredNodeEdges[0].data &&
                        !filteredNodeEdges[0].data.getParams &&
                        filteredNodeEdges[0].data.name !== "Webhook Node"
                      ) {
                        const userResponseVariable =
                          filteredNodeEdges[0].data.text.find(
                            (item) => item.type === "userResponseVariable"
                          );

                        // Access the content property of the userResponseVariable
                        if (userResponseVariable) {
                          const a = userResponseVariable.content;
                          console.log(userResponseVariable.content);
                          Customers.update(
                            { number: from }, // Specify the query criteria to find the document with the phone number
                            {
                              $addToSet: {
                                customField: {
                                  [a]: "",
                                  nodeId: filteredNodeEdges[0].id,
                                }, // Add an object to the customField array with a dynamic key, only if it doesn't already exist
                              },
                            }
                          );
                        }

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
                            return element.type == "list";
                          });

                        let filteredNodeReplyBtnArray =
                          filteredNodeEdges[0].data.text.filter(function (
                            element
                          ) {
                            return element.type == "button";
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
                                    .post(
                                      "https://tudoorg.glitch.me/api/chat",
                                      {
                                        name: "admin",
                                        whatsAppBusinessAccountId:
                                          whatsAppBusinessAccountId,
                                        chatId: from,
                                        message:
                                          filteredNodeTextArray[0].content,
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
                                    .post(
                                      "https://tudoorg.glitch.me/api/chat",
                                      {
                                        name: "admin",
                                        whatsAppBusinessAccountId:
                                          whatsAppBusinessAccountId,
                                        chatId: from,
                                        message:
                                          filteredNodeTextArray[0].content,
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
