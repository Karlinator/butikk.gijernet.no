const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const stripe = require('stripe')(functions.config().stripe.key, {
    apiVersion: '2020-08-27',
});

let db;

const cache = 'public, max-age=300, s-maxage=600'

const filterTransform = true


exports.products = functions.https.onRequest(async (req, resp) => {
    db = db || admin.firestore();

    //const prices = await stripe.prices.list({active: true, expand: ['data.product']});
    //TODO: page through if more than 100 products
    const products = await stripe.products.list({active: true, limit: 100, created: {gt: 1569567232}}).autoPagingToArray({limit: 10000});
    console.log(products)
    const prices = await stripe.prices.list({active: true, limit: 100, created: {gt: 1569567232}}).autoPagingToArray({limit: 10000});
    //TODO: If I ever get Package Pricing to work with Checkout, remove && !p.transform_quantity.
    let productsWithPrices = products.map(v => ({...v, prices: prices.filter(p => v.id === p.product && !(filterTransform && p.transform_quantity))}))
    let types = [...new Set(productsWithPrices.map(v => v.metadata.type))]

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
    types = await Promise.all(types.map(async v => {
        const typeDesc = await db.collection('types').doc(v).get()
        //console.log(productDesc)
        let description;
        //console.log(p.name, productDesc.data())
        try {
            description = typeDesc.data().description
        } catch {
            description = ''
        }
        return {type: v, description: description}
    }))
    if (req.query.noCache) {
        resp.header('Cache-Control', 'no-store')
    } else {
        resp.header('Cache-Control', cache)
    }

    //prices.data.forEach(v => console.log(v.product.images));
    //console.log(productsWithPrices)
    resp.send ({
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


// exports.productDetails = functions.https.onRequest(async (req, resp) => {
//     db = db || admin.firestore();
//
//     let product
//
//     try {
//         product = await stripe.products.retrieve(req.query.id.toString())
//     } catch (e) {
//         resp.status(e.statusCode).send(e.message)
//     }
//
//     const productDescDoc = await db.collection('products').doc(product.id).get()
//     const typeDescDoc = await db.collection('types').doc(product.metadata.type).get()
//     const prices = await stripe.prices.list({product: req.query.id.toString()})
//
//     let productDesc;
//     try {
//         productDesc = productDescDoc.data().description
//     } catch {
//         productDesc = '';
//     }
//     let typeDesc;
//     try {
//         typeDesc = typeDescDoc.data().description
//     } catch {
//         typeDesc = ''
//     }
//
//     resp.header('Cache-Control', cache)
//     resp.status(200).send({
//         id: product.id,
//         description: product.description,
//         longDescription: productDesc,
//         name: product.name,
//         images: product.images,
//         unit_label: product.unit_label,
//         prices: prices.data.filter(p => p.active).map(v => ({id: v.id, amount: v.unit_amount, transform: v.transform_quantity})),
//         type: product.metadata.type,
//         type_description: typeDesc,
//     });
//
// })

/**
 * Provides details (name, price, etc) on a list of prices.
 */
exports.cartDetails = functions.region('europe-west1').https.onCall(async (data) => {
    const productList = data.productList;

    //const products = await Promise.all(priceList.map(v => stripe.prices.retrieve(v, {expand: ['product']})));
    const prices = await Promise.all(productList.map(v => stripe.prices.list({product: v, active: true})))
    const products = await Promise.all(productList.map(v => stripe.products.retrieve(v)))
    const productsWithPrices = products.map(v => ({...v, prices: prices.find(p => p.data[0].product === v.id)}))

    return {products: productsWithPrices.map(v => ({
            id: v.id,
            name: v.name,
            images: v.images,
            prices: v.prices.data.filter(p => !(filterTransform && p.transform_quantity)).map(p => ({id: p.id, amount: p.unit_amount, transform: p.transform_quantity})),
            description: v.description,
        })), shipping: 40};
})

exports.checkout = functions.region('europe-west1').https.onCall(async (data) => {
    data.push({price_data: {currency: 'nok', product_data: {name: 'Frakt'}, unit_amount: 4000}, quantity: 1})
    console.log(data)
    try {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: data,
        locale: "no",
        mode: "payment",
        success_url: "https://butikk.gijernet.no/takk",
        cancel_url: "https://butikk.gijernet.no/cart",
        billing_address_collection: 'auto',
        shipping_address_collection: {
            allowed_countries: ['NO']
        }
    })
        return {id: session.id}
    } catch (error) {
        console.error(error)
        return Promise.reject(error)
    }
})

exports.addProductDetails = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        return {message: "Authentication Required", code: 401}
    }

    db = db || admin.firestore();

    await Promise.all(data.products.map(v => stripe.products.update(v.id, {images: v.images})))

    await Promise.all(data.products.map(v => db.collection('products').doc(v.id).set({description: v.description}, {merge: true})))

    await Promise.all(data.types.map(v => db.collection('types').doc(v.type).set({description: v.description}, {merge: true})))

    return {message: "success", code: 200}

})

exports.resizeImages = functions.region('europe-west1').storage.object().onFinalize(async (object) => {
    const spawn = require('child-process-promise').spawn;
    const path = require('path');
    const os = require('os');
    const fs = require('fs');


    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    //const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        return console.log('This is not an image.');
    }

    // Get the file name.
    const fileName = path.basename(filePath);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('thumb_')) {
        return console.log('Already a Thumbnail.');
    }

    // Download file from bucket.
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
        contentType: contentType,
    };
    await bucket.file(filePath).download({destination: tempFilePath});
    console.log('Image downloaded locally to', tempFilePath);
    // Generate a thumbnail using ImageMagick.
    await spawn('convert', [tempFilePath, '-thumbnail', '300x300>', tempFilePath]);
    console.log('Thumbnail created at', tempFilePath);
    // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    // Uploading the thumbnail.
    await bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata,
    });
    // Once the thumbnail has been uploaded delete the local file to free up disk space.
    return fs.unlinkSync(tempFilePath);
})