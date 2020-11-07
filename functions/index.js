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

    //const prices = await stripe.prices.list({active: true, expand: ['data.product']});

    const products = await stripe.products.list({active: true, created: {gt: 1569577232}});
    const prices = await Promise.all(products.data.map(v => (stripe.prices.list({product: v.id}))));
    const productsWithPrices = products.data.map(v => ({...v, prices: prices.find(p => v.id === p.data[0].product)}))
    const types = [...new Set(productsWithPrices.map(v => v.metadata.type))]

    //prices.data.forEach(v => console.log(v.product.images));

    response.send({
        products: productsWithPrices.map(v => ({
            id: v.id,
            title: v.name,
            subtitle: v.description,
            images: v.images,
            prices: v.prices.data.map(p => ({id: p.id, amount: p.unit_amount})),
            type: v.metadata.type
        })),
        types: types
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
        description: product.description,
        longDescription: description,
        name: product.name,
        images: product.images,
        unit_label: product.unit_label,
        price: {
            id: prices.data[0].id,
            amount: prices.data[0].unit_amount,
        },
        type: product.metadata.type
    });

})

/**
 * Provides details (name, price, etc) on a list of prices.
 */
exports.cartDetails = functions.https.onRequest(async (request, response) => {
    const productList = request.body.productList;

    //const products = await Promise.all(priceList.map(v => stripe.prices.retrieve(v, {expand: ['product']})));
    const prices = await Promise.all(productList.map(v => stripe.prices.list({product: v})))
    const products = await Promise.all(productList.map(v => stripe.products.retrieve(v)))
    const productsWithPrices = products.map(v => ({...v, prices: prices.find(p => p.data[0].product === v.id)}))

    console.log(productsWithPrices)

    const r = {products: productsWithPrices.map(v => ({
            id: v.id,
            name: v.name,
            image: v.images[0],
            prices: v.prices.data.map(p => ({id: p.id, amount: p.unit_amount, transform: p.transform_quantity})),
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
        cancel_url: "https://store.gijernet.no/avbrutt",
        billing_address_collection: 'auto',
        shipping_address_collection: {
            allowed_countries: ['NO']
        }


    })
        .then(result => response.json({id: result.id}))
        .catch(error => response.send(error));
})

exports.addProductDetails = functions.https.onRequest((request, response) => {

})
