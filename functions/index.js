const functions = require('firebase-functions');
const admin = require('firebase-admin');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp()

const createNotifications = ((notification, documentId) => {
    const db = admin.firestore(); 
    return db.collection('hotels').doc(documentId).collection('notifications')
    .add(notification)
    .then(doc => console.log('nouvelle notitfication'))
})

exports.createUser = functions.https.onCall((email, password, refHotel) => {
    return admin.auth().createUser({
        email: email,
        password: password,
        displayName: refHotel
      })
})

const deleteUser = (userId => {
    const auth = admin.auth();
    return auth.deleteUser(userId);
})

const updateRooms = ((documentId) => {
    const db = admin.firestore();
    const roomAvailable = db.collection("hotels").doc(documentId)
    .get()
    .then(function(doc) {
        const hotelDetails = doc.data()
        const roomStatus = hotelDetails.roomAvailable
        const updateRoomStatus = roomStatus - 1
        return updateRoomStatus
    })
    return roomAvailable 
})




exports.listenOverbooking = functions.firestore
.document('hotels/{hotelId}/overbooking/{tables}/overbookIn/{Id}')
.onCreate((doc, context) => {
 const overIn = doc.data()
 const hotelRef = context.params.hotelId
 const notification = {
    content: "Vous avez reçu une nouvelle demande d'accueil.",
    markup: Date.now()
 }

 return createNotifications(notification, hotelRef)
})


exports.listenOverbooking2 = functions.firestore
.document('hotels/{hotelId}/overbooking/{tables}/overbookOut/{Id}')
.onUpdate((change, context) => {
    const overOut = change.after.data()
    const status = overOut.status
    const hotel = overOut.hotelName
    const client = overOut.client
    const refHotel = overOut.refHotel
    if(status === "granted") {
        const notificationGranted = {
            content: "Votre demande de délogement vers l'hôtel " + hotel + " pour le compte de " + client + " a été acceptée.",
            markup: Date.now()}
        return createNotifications(notificationGranted, refHotel)
     }else if(status === "refused") {
        const notificationRejected = {
            content: "Votre demande de délogement vers l'hôtel " + hotel + " pour le compte de " + client + " a été refusée.",
            markup: Date.now()}
            return createNotifications(notificationRejected, refHotel)
     }else{
         console.log("Erreur fonctions notifications")
     }

})

exports.roomUpdate = functions.firestore
.document('hotels/{hotelId}/overbooking/{tables}/overbookIn/{Id}')
.onUpdate((change, context) => {
    const overIn = change.after.data()
    const status = overIn.status
    const refHotel = context.params.hotelId
    if(status === "granted") {
        return updateRooms(refHotel)
     }else{
         console.log("No changes")
     }

})

exports.userDelete = functions.firestore
.document('hotels/{hotelId}/Users/{userId}')
.onDelete((snap, contex) => {
    const deletedValue = snap.data();
    const userId = deletedValue.userId

    return deleteUser(userId);
})


