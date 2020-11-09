import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import ProductPage from "./product/Product";
import Cart from "./cart/Cart";
import Browse from "./browse/Browse";
import Admin from "./admin/Admin";
import {analytics} from "./firebase";
import CookieKit from 'react-cookie-kit'
import 'react-cookie-kit/dist/xck-react-theme-popup.css'

function App() {
    if (!window.localStorage.getItem('cart') || JSON.parse(window.localStorage.getItem('cart')).find(v => v.id.includes('price'))) {
        window.localStorage.setItem('cart', '[]')
    }
    const cookieHandler = (consent) => {
        console.log(consent)
        if (consent.statistics) {
            analytics.setAnalyticsCollectionEnabled(true)
            console.log('analytics enabled')
        } else {
            analytics.setAnalyticsCollectionEnabled(false)
            console.log('analytics disabled')
        }
    }
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/cart">
                        <Cart />
                    </Route>
                    <Route path="/admin">
                        <Admin />
                    </Route>
                    <Route path="/:id" children={<ProductPage />}/>
                    <Route path="/">
                        <Browse />
                    </Route>
                </Switch>
            </Router>
            <CookieKit
                cssAutoLoad={true}
                cookieHandler={cookieHandler}
                privacyUrl="/privacy"
                termsUrl="/terms"
                requestDataTypes={['statistics', 'application']}
                detectCountry={true}
                hideBrandTag={true}
                testMode={process.env.NODE_ENV !== 'production'}
                textMessage="Vi bruker cookies for at betalingsløsningen skal fungere, og for statistikk hvis du godtar det."
            />
        </div>
    );
}

export default App;
