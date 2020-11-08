import firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/functions'
import 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBMfRunxxEEb-1mWRbDXYQCxFnTLTtD0FE",
    authDomain: "gijernet-no.firebaseapp.com",
    databaseURL: "https://gijernet-no.firebaseio.com",
    projectId: "gijernet-no",
    storageBucket: "gijernet-no.appspot.com",
    messagingSenderId: "869445831132",
    appId: "1:869445831132:web:ef4c96796a07a851e66719"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

const storage = firebase.storage()

const functions = firebase.app().functions('europe-west1')
const auth = firebase.auth()

if (process.env.NODE_ENV !== 'development') {
    functions.useEmulator("localhost", 5001)
}

export  {
    storage, firebaseConfig, functions, auth, firebase as default
}

