const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
    console.log("Checking Firestore...");
    const users = await db.collection('users').get();
    if (users.empty) {
        console.log("No users found in Firestore!");
    } else {
        for (const user of users.docs) {
            console.log("User:", user.id);
            const history = await user.ref.collection('history').get();
            console.log("  History items:", history.size);
            history.forEach(doc => {
                console.log("    =>", doc.data().name, "| Type:", doc.data().type, "| Score:", doc.data().score);
            });
        }
    }
}
check();
