import React, {lazy, Suspense} from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import ProductPage from "./product/Product";
import Cart from "./cart/Cart";
import Browse from "./browse/Browse";
import {analytics} from "./firebase";
import CookieKit from 'react-cookie-kit'
import 'react-cookie-kit/dist/xck-react-theme-popup.css'
import {CircularProgress, Fade} from "@material-ui/core";
const Admin = lazy(() => import("./admin/Admin"));

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
                        <Suspense fallback={
                            <div style={{flexGrow: 1}}>
                                <Fade
                                    in
                                    style={{
                                        transitionDelay: '800ms',
                                        marginLeft: '40%',
                                        marginTop: 50,
                                    }}
                                    unmountOnExit
                                >
                                    <CircularProgress />
                                </Fade>
                            </div>
                        }>
                            <Admin />
                        </Suspense>
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
