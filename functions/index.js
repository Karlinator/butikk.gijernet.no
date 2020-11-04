const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const stripe = require('stripe')(functions.config().stripe.key, {
    apiVersion: '2020-08-27',
});

let db;

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


exports.products = functions.https.onRequest(async (request, response) => {

    const prices = await stripe.prices.list({active: true, expand: ['data.product']});

    //prices.forEach(v => console.log(v.data[0]));

    response.send({
        products: prices.data.filter(v => v.product.active === true).map(v => ({
            id: v.product.id,
            title: v.product.name,
            subtitle: v.product.description,
            img: v.product.images[0],
            price: {
                id: v.id,
                amount: v.unit_amount
            }
        }))
    })
})

exports.productDetails = functions.https.onRequest(async (request, response) => {
    db = admin.firestore();

    const product = await stripe.products.retrieve(request.query.id.toString())
    const productDesc = await db.collection('products').doc(product.id).get()
    const prices = await stripe.prices.list({product: request.query.id.toString()})

    let description;
    try {
        description = productDesc.data().description
    } catch {
        description = '';
    }


    response.send({
        id: product.id,
        description: description,
        name: product.name,
        images: product.images,
        unit_label: product.unit_label,
        price: {
            id: prices.data[0].id,
            amount: prices.data[0].unit_amount,
        }
    });

})

/**
 * Provides details (name, price, etc) on a list of prices.
 */
exports.cartDetails = functions.https.onRequest(async (request, response) => {
    const priceList = request.body.priceList;
    console.log(priceList)

    const products = await Promise.all(priceList.map(v => stripe.prices.retrieve(v, {expand: ['product']})));

    console.log(products)

    const r = {products: products.map(v => ({
            id: v.product.id,
            name: v.product.name,
            image: v.product.images[0],
            price: {
                amount: v.unit_amount,
                id: v.id,
            }
        })), shipping: 550};

    response.send(r)
})

exports.checkout = functions.https.onRequest((request, response) => {
    console.log(request.body)
    stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: JSON.parse(request.body),
        mode: "payment",
        success_url: "https://store.gijernet.no/takk",
        cancel_url: "https://store.gijernet.no/avbrutt"

    })
        .then(result => response.json({id: result.id}))
        .catch(error => response.send(error));
})
