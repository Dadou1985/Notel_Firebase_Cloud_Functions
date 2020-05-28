const functions = require('firebase-functions');
const admin = require('firebase-admin');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp()

const createNotifications = (notification => {
    const db = admin.firestore(); 
    return db.collection('hotels').doc('H9781').collection('notifications')
    .add(notification)
    .then(doc => console.log('nouvelle notitfication'))
})


exports.listenOverbooking = functions.firestore
.document('hotels/{H9781}/overbooking/{tables}/overbookIn/{Id}')
.onCreate(doc => {
 const overIn = doc.data()
 const notification = {
    content: "Vous avez reçu une nouvelle demande d'accueil.",
    markup: Date.now()
 }

 return createNotifications(notification)
})


exports.listenOverbooking2 = functions.firestore
.document('hotels/{H9781}/overbooking/{tables}/overbookOut/{Id}')
.onUpdate((change, context) => {
    const overOut = change.after.data()
    const status = overOut.status
    const hotel = overOut.hotelName
    const client = overOut.client
    if(status === "granted") {
        const notificationGranted = {
            content: "Votre demande de délogement vers l'hôtel " + hotel + " pour le compte de " + client + " a été acceptée.",
            markup: Date.now()}
        return createNotifications(notificationGranted)
     }else if(status === "refused") {
        const notificationRejected = {
            content: "Votre demande de délogement vers l'hôtel " + hotel + " pour le compte de " + client + " a été refusée.",
            markup: Date.now()}
            return createNotifications(notificationRejected)
     }else{
         console.log("Erreur fonctions notifications")
     }

})



