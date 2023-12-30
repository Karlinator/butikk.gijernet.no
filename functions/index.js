import { config, https, region } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { spawn } from "child-process-promise";
import Stripe from "stripe";
initializeApp(config().firebase);
const stripe = new Stripe(config().stripe.key, {
  apiVersion: "2020-08-27",
});

let db;

const cache = "public, max-age=300, s-maxage=600";
const enableCache = config().cache.enable === "true";
const expires = () => {
  const date = new Date();
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

const filterTransform = true;

export const products = https.onRequest(async (req, resp) => {
  db = db || getFirestore();

  const products = await stripe.products
    .list({ active: true, limit: 100, created: { gt: 1569567232 } })
    .autoPagingToArray({ limit: 10000 });
  //console.log(products)
  const prices = await stripe.prices
    .list({ active: true, limit: 100, created: { gt: 1569567232 } })
    .autoPagingToArray({ limit: 10000 });
  //TODO: If I ever get Package Pricing to work with Checkout, remove && !p.transform_quantity.
  let productsWithPrices = products.map((v) => ({
    ...v,
    prices: prices.filter(
      (p) => v.id === p.product && !(filterTransform && p.transform_quantity)
    ),
  }));
  let types = [...new Set(productsWithPrices.map((v) => v.metadata.type))];

  productsWithPrices = await Promise.all(
    productsWithPrices.map(async (p) => {
      //console.log(productDesc)
      let description;
      //console.log(p.name, productDesc.data())
      try {
        const productDesc = await db.collection("products").doc(p.id).get();
        description = productDesc.data().description;
      } catch {
        description = "";
      }
      return { ...p, longDescription: description };
    })
  );
  types = await Promise.all(
    types.map(async (v) => {
      //console.log(productDesc)
      let description;
      //console.log(p.name, productDesc.data())
      try {
        const typeDesc = await db.collection("types").doc(v).get();
        description = typeDesc.data().description;
      } catch {
        description = "";
      }
      return { type: v, description: description };
    })
  );

  productsWithPrices.sort((a, b) => {
    if (a.metadata.type > b.metadata.type) {
      return 1;
    } else if (a.metadata.type < b.metadata.type) {
      return -1;
    }
    return a.name <= b.name ? -1 : 1;
  });

  if (req.query.noCache || !enableCache) {
    console.log("no-store");
    resp.header("Cache-Control", "no-store");
  } else {
    console.log("cache");
    resp.header("Cache-Control", cache);
    //resp.header('Expires', expires().toUTCString())
  }

  //prices.data.forEach(v => console.log(v.product.images));
  //console.log(productsWithPrices)
  resp.send({
    products: productsWithPrices.map((v) => ({
      id: v.id,
      title: v.name,
      subtitle: v.description,
      images: v.images,
      prices: v.prices.map((p) => ({ id: p.id, amount: p.unit_amount })),
      type: v.metadata.type,
      longDescription: v.longDescription,
    })),
    types: types,
  });
});

export const cartDetails = region("europe-west1").https.onCall(async (data) => {
  const productList = data.productList;

  //const products = await Promise.all(priceList.map(v => stripe.prices.retrieve(v, {expand: ['product']})));
  const prices = await Promise.all(
    productList.map((v) => stripe.prices.list({ product: v, active: true }))
  );
  const products = await Promise.all(
    productList.map((v) => stripe.products.retrieve(v))
  );
  const productsWithPrices = products.map((v) => ({
    ...v,
    prices: prices.find((p) => p.data[0].product === v.id),
  }));

  return {
    products: productsWithPrices.map((v) => ({
      id: v.id,
      name: v.name,
      images: v.images,
      prices: v.prices.data
        .filter((p) => !(filterTransform && p.transform_quantity))
        .map((p) => ({
          id: p.id,
          amount: p.unit_amount,
          transform: p.transform_quantity,
        })),
      description: v.description,
    })),
    shipping: 40,
  };
});

export const checkout = region("europe-west1").https.onCall(async (data) => {
  //data.push({price_data: {currency: 'nok', product_data: {name: 'Frakt'}, unit_amount: 4000}, quantity: 1})
  console.log(data);
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: data,
      locale: "nb",
      mode: "payment",
      success_url: "https://butikk.gijernet.no/takk",
      cancel_url: "https://butikk.gijernet.no/cart",
      billing_address_collection: "auto",
      shipping_rates: [config().stripe.shipping],
      shipping_address_collection: {
        allowed_countries: ["NO"],
      },
      allow_promotion_codes: true,
    });
    return { id: session.id };
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

export const addProductDetails = region("europe-west1").https.onCall(
  async (data, context) => {
    if (!context.auth) {
      return { message: "Authentication Required", code: 401 };
    }

    db = db || getFirestore();

    await Promise.all(
      data.products.map((v) =>
        stripe.products.update(v.id, { images: v.images })
      )
    );

    await Promise.all(
      data.products.map((v) =>
        db
          .collection("products")
          .doc(v.id)
          .set({ description: v.description }, { merge: true })
      )
    );

    await Promise.all(
      data.types.map((v) =>
        db
          .collection("types")
          .doc(v.type)
          .set({ description: v.description }, { merge: true })
      )
    );

    return { message: "success", code: 200 };
  }
);

export const resizeImages = region("europe-west1")
  .storage.bucket("static.gijernet.no")
  .object()
  .onFinalize(async (object) => {
    const path = await import("path");
    const os = await import("os");
    const fs = await import("fs");

    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    //const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith("image/")) {
      return console.log("This is not an image.");
    }

    // Get the file name.
    const fileName = path.basename(filePath);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith("thumb_")) {
      return console.log("Already a Thumbnail.");
    }

    // Download file from bucket.
    const bucket = getStorage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
      contentType: contentType,
    };
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log("Image downloaded locally to", tempFilePath);
    // Generate a thumbnail using ImageMagick.
    await spawn("convert", [
      tempFilePath,
      "-thumbnail",
      "300x300>",
      tempFilePath,
    ]);
    console.log("Thumbnail created at", tempFilePath);
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
  });
