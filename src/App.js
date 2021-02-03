import React, {lazy, Suspense, useEffect, useState} from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import ProductPage from "./product/Product";
import Cart from "./cart/Cart";
import Browse from "./browse/Browse";
//import CookieKit from 'react-cookie-kit'
//import 'react-cookie-kit/dist/xck-react-theme-popup.css'
import {AppBar, CircularProgress, Fade, IconButton, Toolbar, Typography} from "@material-ui/core";
import {FilterList} from "@material-ui/icons";
import Privacy from "./Privacy";
const Admin = lazy(() => import("./admin/Admin"));
const Success = lazy(() => import("./takk/Success"))

function App() {
    if (!window.localStorage.getItem('cart') || JSON.parse(window.localStorage.getItem('cart')).find(v => v.id.includes('price'))) {
        window.localStorage.setItem('cart', '[]')
    }
    // const cookieHandler = (consent) => {
    //     console.log(consent)
    //     if (consent.statistics) {
    //         analytics.setAnalyticsCollectionEnabled(true)
    //         console.log('analytics enabled')
    //     } else {
    //         analytics.setAnalyticsCollectionEnabled(false)
    //         console.log('analytics disabled')
    //     }
    // }

    const [products, setProducts] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/products/')
            .then(res => res.json())
            .then(
                result => {
                    setProducts(result)
                    setLoading(false)
                },
                (error) => {
                    console.log(error)
                }
            )
    }, []);

    if(loading) {
        return (
            <div align="center" style={{flexGrow: 1}}>
                <AppBar position="sticky">
                    <Toolbar>
                        <IconButton color="inherit">
                            <FilterList/>
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Gi Jernet Nettbutikk
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Fade
                    in
                    style={{
                        transitionDelay: '800ms',
                        marginTop: '35vh',
                    }}
                    unmountOnExit
                >
                    <CircularProgress size={80} />
                </Fade>
            </div>
        )
    }

    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/cart">
                        <Cart products={products} />
                    </Route>
                    <Route path="/admin">
                        <Suspense fallback={
                            <div align="center" style={{flexGrow: 1}}>
                                <Fade
                                    in
                                    style={{
                                        transitionDelay: '800ms',
                                        marginTop: '35vh',
                                    }}
                                    unmountOnExit
                                >
                                    <CircularProgress size={80} />
                                </Fade>
                            </div>
                        }>
                            <Admin />
                        </Suspense>
                    </Route>
                    <Route path="/takk">
                        <Suspense fallback={
                            <div align="center" style={{flexGrow: 1}}>
                                <Fade
                                    in
                                    style={{
                                        transitionDelay: '800ms',
                                        marginTop: '35vh',
                                    }}
                                    unmountOnExit
                                >
                                    <CircularProgress size={80} />
                                </Fade>
                            </div>
                        }>
                            <Success/>
                        </Suspense>
                    </Route>
                    <Route path="/privacy">
                        <Privacy />
                    </Route>
                    <Route path="/:id" children={<ProductPage products={products} />}/>
                    <Route path="/">
                        <Browse products={products} />
                    </Route>
                </Switch>
            </Router>
            {/*<CookieKit*/}
            {/*    cssAutoLoad={true}*/}
            {/*    cookieHandler={cookieHandler}*/}
            {/*    privacyUrl="/privacy"*/}
            {/*    termsUrl="/terms"*/}
            {/*    requestDataTypes={['statistics', 'application']}*/}
            {/*    hideBrandTag={true}*/}
            {/*    testMode={process.env.NODE_ENV !== 'production'}*/}
            {/*    textMessage="Vi bruker cookies for at betalingsløsningen skal fungere, og for statistikk hvis du godtar det."*/}
            {/*/>*/}
        </div>
    );
}

export default App;
