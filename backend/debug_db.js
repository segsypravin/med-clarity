const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function dumpHistory() {
    try {
        const usersSnapshot = await db.collection('users').get();
        console.log(`Found ${usersSnapshot.size} users.`);

        for (const userDoc of usersSnapshot.docs) {
            console.log(`\nUser: ${userDoc.id}`);
            const historySnapshot = await userDoc.ref.collection('history')
                .orderBy('createdAt', 'desc')
                .limit(2)
                .get();

            if (historySnapshot.empty) {
                console.log('  No history found.');
                continue;
            }

            historySnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`  Report: ${data.name} (${data.date})`);
                const res = data.result || {};
                const tests = res.tests || res.ai_analysis || [];
                console.log(`  Tests: ${tests.length}`);
                tests.forEach(t => {
                    const name = t.test || t.name;
                    console.log(`    - [${name}] : ${t.value}`);
                });
            });
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

dumpHistory();
