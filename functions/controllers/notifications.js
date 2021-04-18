const admin=require('firebase-admin');
const functions=require('firebase-functions');
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
console.log('notifications');
const db=admin.firestore();
exports.onPayment = functions.firestore.document('customersPayments/{docId}').onCreate(async(snapshot,context)=>{
  let user=await db.collection('users').doc(snapshot.data().customerId).get();
  console.log('user=',user);
  if(user){
   return admin.messaging().sendToDevice(user.data().token,{
        data:{
            click_action: "FLUTTER_NOTIFICATION_CLICK"},
            notification:{
            title:'Payment alert!',
            sound:"default",
            body:`Payment made ${snapshot.data().amount},pending verifications by admin`,
            badge:"1",
            tag:snapshot.id,
        }
    },notification_options);
  }
    
})
exports.onPaymentStatusChange = functions.firestore.document('customersPayments/{docId}').onUpdate(async(snapshot,context)=>{
  let user=await db.collection('users').doc(snapshot.after.data().customerId).get();
  
  if(user){
    let message=snapshot.after.data().isConfirmed?'Payment verified':'Payment verifications failed';
   return admin.messaging().sendToDevice(user.data().token,{
        data:{
            click_action: "FLUTTER_NOTIFICATION_CLICK"},
            notification:{
            title:'Payment alert!',
            sound:"default",
            body:`Payment updated ${snapshot.after.data().amount},${message}`,
            badge:"1",
            tag:snapshot.after.id,
        }
    },notification_options);
  }
  try{
    let user=await db.collection('users').doc(snapshot.after.data().collectedBy).get();
    let message=snapshot.after.data().isConfirmed?'Payment verified':'Payment verifications failed';
    admin.messaging().sendToDevice(user.data().token,{
        data:{
            click_action: "FLUTTER_NOTIFICATION_CLICK"},
            notification:{
            title:'Payment alert!',
            sound:"default",
            body:`Payment updated ${snapshot.after.data().amount},${message}`,
            badge:"1",
            tag:snapshot.after.id,
        }
    },notification_options);
  }
  catch(e){

  }
    
})
exports.onAppointment = functions.firestore.document('appointmentCollections/{docId}').onCreate(async(snapshot,context)=>{
  let user=await db.collection('users').doc(snapshot.data().salesMan).get();
  if(user){
   return admin.messaging().sendToDevice(user.data().token,{
        data:{
            click_action: "FLUTTER_NOTIFICATION_CLICK"},
            notification:{
            title:'New appointment!',
            sound:"default",
            body:`You have a new appointment at ${snapshot.data().date}
            with  
            name:${snapshot.data().name} ${snapshot.data().familyName}`,
            badge:"1",
            tag:snapshot.id,
        }
    },notification_options);
  }
    
})