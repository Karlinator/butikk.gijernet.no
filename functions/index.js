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

const getStripeProductsWithPrices = (productList) => {
    let productListDetailed = [];

    productList.forEach(product => {
            productListDetailed.push(stripe.products.retrieve(product));
        }
    )

    let responseList = {};

    return Promise.all(productListDetailed).then((values) => {
        responseList.products = values;
        const pricesCalls = values.map(v => stripe.prices.list({product: v.id}))
        return Promise.all(pricesCalls);
    })
        .then((values) => {
            responseList.prices = values.map(v => v.data[0]);
            responseList.prices.forEach(price => {
                responseList.products[responseList.products.findIndex(product => product.id === price.product)].price = price;
            })
            return responseList.products;
        })
        .catch(

        )
}

exports.products = functions.https.onRequest(async (request, response) => {

    const products = await stripe.products.list();

    response.send({
        products: products.data.map(v => ({
            id: v.id,
            title: v.name,
            subtitle: v.description,
            img: v.images[0]
        }))
    })
})

exports.productDetails = functions.https.onRequest(async (request, response) => {
    db = admin.firestore();

    const product = await stripe.products.retrieve(request.query.id.toString())
    const productDesc = await db.collection('products').doc(product.id).get()
    const prices = await stripe.prices.list({product: request.query.id.toString()})

    const description = productDesc.data().description

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
 * Provides details (name, price, etc) on a list of SKUs.
 */
exports.cartDetails = functions.https.onRequest((request, response) => {
    const productList = request.body.productList;

    getStripeProductsWithPrices(productList).then(values => {
            return response.send({products: values.map(v => ({
                id: v.id,
                name: v.name,
                image: v.images[0],
                price: {
                    amount: v.price.unit_amount,
                    id: v.price.id,
                }
            })), shipping: 550});
    })
        .catch((error) =>
            response.send(error)
        )



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
        .then(result => response.send({id: result.id}))
        .catch(error => response.send(error));
})
