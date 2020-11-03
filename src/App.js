import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import ProductPage from "./product/Product";
import Cart from "./cart/Cart";
import Browse from "./browse/Browse";

function App() {
    if (!window.localStorage.getItem('cart') || JSON.parse(window.localStorage.getItem('cart')).find(v => v.id.includes('prod'))) {
        window.localStorage.setItem('cart', '[]')
    }
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/cart">
                        <Cart />
                    </Route>
                    <Route path="/:id" children={<ProductPage />}/>
                    <Route path="/">
                        <Browse />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
