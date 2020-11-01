const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.products = functions.https.onRequest((request, response) => {
    response.send(JSON.stringify({
        products: [
            {id: 'dashjkas', title: 'test', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'gfsd', title: 'test2', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'hdfsg', title: 'test3', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'sdf', title: 'test4', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'dsghgdf', title: 'test5', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'gdsazfg', title: 'test6', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'hser', title: 'test7', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: '245654', title: 'test8', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'dfzbhg', title: 'test9', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
            {id: 'sd<fsd', title: 'test10', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        ]}));
})
