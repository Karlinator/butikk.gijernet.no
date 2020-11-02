const functions = require('firebase-functions');
const Stripe = require('stripe');
const stripe = Stripe(functions.config().stripe.key)

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
/**
 * Provides details (name, price, etc) on a list of SKUs.
 */
exports.productDetails = functions.https.onRequest((request, response) => {
    const productList = request.body.productList;

    getStripeProductsWithPrices(productList).then(values => {
            return response.send(values.map(v => ({
                id: v.id,
                name: v.name,
                image: v.images[0],
                price: v.price.unit_amount
            })));
    })
        .catch(
        )



})
