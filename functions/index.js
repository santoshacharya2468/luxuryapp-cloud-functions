const admin=require('firebase-admin');
admin.initializeApp();
module.exports = {
  ...require("./controllers/user"),
  ...require('./controllers/notifications')
};
