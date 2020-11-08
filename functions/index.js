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


exports.products = functions.region('europe-west1').https.onCall(async (data) => {
    db = db || admin.firestore();

    //const prices = await stripe.prices.list({active: true, expand: ['data.product']});
    //TODO: page through if more than 100 products
    const products = await stripe.products.list({active: true, limit: 100, created: {gt: 1569567232}});
    const prices = await stripe.prices.list({limit: 100, created: {gt: 1569567232}});
    let productsWithPrices = products.data.map(v => ({...v, prices: prices.data.filter(p => v.id === p.product && !p.transform_quantity)}))
    const types = [...new Set(productsWithPrices.map(v => v.metadata.type))]

    if (data.descriptions) {
        productsWithPrices = await Promise.all(productsWithPrices.map(async p => {
            const productDesc = await db.collection('products').doc(p.id).get()
            //console.log(productDesc)
            let description;
            //console.log(p.name, productDesc.data())
            try {
                description = productDesc.data().description
            } catch {
                description = ''
            }
            return {...p, longDescription: description}

        }))
    }

    //prices.data.forEach(v => console.log(v.product.images));
    //console.log(productsWithPrices)

    return ({
        products: productsWithPrices.map(v => ({
            id: v.id,
            title: v.name,
            subtitle: v.description,
            images: v.images,
            prices: v.prices.map(p => ({id: p.id, amount: p.unit_amount})),
            type: v.metadata.type,
            longDescription: v.longDescription
        })),
        types: types
    })
})


exports.productDetails = functions.region('europe-west1').https.onCall(async (data) => {
    db = db || admin.firestore();

    const product = await stripe.products.retrieve(data.id.toString())
    const productDesc = await db.collection('products').doc(product.id).get()
    const prices = await stripe.prices.list({product: data.id.toString()})

    let description;
    try {
        description = productDesc.data().description
    } catch {
        description = '';
    }


    return ({
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
exports.cartDetails = functions.region('europe-west1').https.onCall(async (data) => {
    const productList = data.productList;

    //const products = await Promise.all(priceList.map(v => stripe.prices.retrieve(v, {expand: ['product']})));
    const prices = await Promise.all(productList.map(v => stripe.prices.list({product: v})))
    const products = await Promise.all(productList.map(v => stripe.products.retrieve(v)))
    const productsWithPrices = products.map(v => ({...v, prices: prices.find(p => p.data[0].product === v.id)}))

    console.log(productsWithPrices)

    return {products: productsWithPrices.map(v => ({
            id: v.id,
            name: v.name,
            image: v.images[0],
            prices: v.prices.data.map(p => ({id: p.id, amount: p.unit_amount, transform: p.transform_quantity})),
        })), shipping: 550};
})

exports.checkout = functions.region('europe-west1').https.onCall(async (data) => {
    console.log(data.body)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: JSON.parse(data.body),
        mode: "payment",
        success_url: "https://store.gijernet.no/takk",
        cancel_url: "https://store.gijernet.no/avbrutt",
        billing_address_collection: 'auto',
        shipping_address_collection: {
            allowed_countries: ['NO']
        }
    })
    try {
        return {id: session.id}
    } catch {
        return {message: session}
    }
})

exports.addProductDetails = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        return {message: "Authentication Required", code: 401}
    }

    db = db || admin.firestore();

    await Promise.all(data.map(v => stripe.products.update(v.id, {images: v.images})))

    await Promise.all(data.map(v => db.collection('products').doc(v.id).set({description: v.description}, {merge: true})))

    return {message: "success", code: 200}

})
