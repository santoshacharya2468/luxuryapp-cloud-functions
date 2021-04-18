const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");
// admin.initializeApp();
functions.firestore.document('customersPayments').onCreate(async(snapshot,context)=>{
  console.log('event fired',snapshot.data())
  // var user=await db.collection('users').doc(snapshot.data().customerId).get();
  // console.log('user ',user);
})
const authMiddleware = require("../authMiddleware");

const userApp = express();

userApp.use(cors({ origin: true }));
userApp.use(authMiddleware);

const db = admin.firestore();

userApp.get("/", async (req, res) => {
  const role = req.query.role;
  const snapshot = await db.collection("users").where("role", "==", role).get();

  let users = [];
  snapshot.forEach((doc) => {
    let id = doc.id;
    let data = doc.data();

    users.push({ id, ...data });
  });

  res.status(200).send(JSON.stringify(users));
});

userApp.get("/:id", async (req, res) => {
  const snapshot = await db.collection("users").doc(req.params.id).get();

  const userId = snapshot.id;
  const userData = snapshot.data();

  res.status(200).send(JSON.stringify({ id: userId, ...userData }));
});

userApp.post("/", async (req, res) => {
  const userReq = req.body;
  admin
    .auth()
    .createUser({
      email: userReq.email,
      emailVerified: false,
      password: userReq.password,
      displayName: userReq.displayName,
      disabled: false,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
      res.status(201).send(userRecord);
    })
    .catch((error) => {
      console.log("Error creating new user:", error);
      throw new Error(error);
    });

  // await db.collection("users").add(user);
});

userApp.put("/:id", async (req, res) => {
  const userReq = req.body;
  if(userReq.password!=undefined){
    admin
    .auth()
    .updateUser(req.params.id, {
      email: userReq.email,
      password:userReq.password,
      displayName: userReq.displayName,
    })
    .then((userRecord) => {
      console.log("Successfully updated user", userRecord.toJSON());
      res.status(200).send(userRecord);
    })
    .catch((error) => {
      console.log("Error updating user:", error);
      res.send({error});
    });
  }else{
  // let pass = null;
  // if(userReq.password){
  //   pass = userReq.password;
  // }
  admin
    .auth()
    .updateUser(req.params.id, {
      email: userReq.email,
      // password: pass,
      
      displayName: userReq.displayName,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully updated user", userRecord.toJSON());
      res.status(200).send(userRecord);
    })
    .catch((error) => {
      console.log("Error updating user:", error);
      res.send({error});
    });
  }
  // await db.collection("users").doc(req.params.id).update(body);
});

userApp.delete("/:id", async (req, res) => {
  await admin
    .auth()
    .deleteUser(req.params.id)
    .then(() => {
      console.log("Successfully deleted user");
      res.status(200).send();
    })
    .catch((error) => {
      console.log("Error deleting user:", error);
      res.status(409).send({ error: error });
    });
});

exports.user = functions.https.onRequest(userApp);
