import firebase from 'firebase/app'
import 'firebase/functions'
import 'firebase/analytics'

const firebaseConfig = {
    apiKey: "AIzaSyBMfRunxxEEb-1mWRbDXYQCxFnTLTtD0FE",
    authDomain: "gijernet-no.firebaseapp.com",
    databaseURL: "https://gijernet-no.firebaseio.com",
    projectId: "gijernet-no",
    storageBucket: "static.gijernet.no",
    messagingSenderId: "869445831132",
    appId: "1:869445831132:web:ef4c96796a07a851e66719",
    measurementId: "G-1FKMHYSSX2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const analytics = firebase.analytics();

const functions = firebase.app().functions('europe-west1')

if (process.env.NODE_ENV !== 'production') {
    functions.useEmulator("localhost", 5001)
}

export  {
    firebaseConfig, functions, firebase as default
}

