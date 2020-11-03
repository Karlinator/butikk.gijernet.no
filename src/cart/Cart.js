import React, {useEffect, useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import {
    TableCell,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableBody,
    Container,
    AppBar,
    Toolbar,
    IconButton,
    TextField, Button, Fade, CircularProgress,
} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import {Link} from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    img: {
        maxHeight: 100,
    },
    number: {
        width: 70,
    },
    link: {
        color: 'inherit',
    },
    center: {
        marginLeft: '40%',
        marginTop: 50,
    },
    order: {
        float: 'right',
        marginTop: 20,
    }
});

// const products = [
//     {
//         name: "Test",
//         variant: "vanlig",
//         image: "/logo512.png",
//         quantity: 5,
//         price: 200
//     },
//     {
//         name: "Test2",
//         variant: "vanlig",
//         image: "/logo512.png",
//         quantity: 5,
//         price: 152
//     },
//     {
//         name: "Test3",
//         variant: "ekstraordinær",
//         image: "/logo512.png",
//         quantity: 7,
//         price: 200
//     },
//     {
//         name: "Test4",
//         variant: "vanlig",
//         image: "/logo512.png",
//         quantity: 69,
//         price: 420
//     },
// ]


const Cart = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState(null);
    const [shipping, setShipping] = useState(0);


    const handleCartNumChange = (e, id) => {
        if (e.target.value >= 0 && e.target.value !== '') {
            const p = products.map(v => ({...v, quantity: v.id !== id ? v.quantity : e.target.value}));
            setProducts(p);
            window.localStorage.setItem('cart', JSON.stringify(p.map(v => ({id: v.id, num: v.quantity}))))
        }
    }

    const handleCheckout = async () => {
        console.log(products.map(v => ({price: v.price.id, quantity: v.quantity})))
        const stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY)
        const response = await fetch('/api/checkout', {
            method: 'POST',
            body: JSON.stringify(products.map(v => ({price: v.price.id, quantity: parseInt(v.quantity)})))
        });
        const session = await response.json();

        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        })

        if (result.error) {
            window.alert(result.error.message);
        }
    }

    useEffect(() => {
        const cartList = JSON.parse(window.localStorage.getItem('cart'));
        const priceList = cartList.map(item => item.id);
        fetch('/api/cartDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({priceList: priceList})
        })
            .then(result => result.json())
            .then(result => {
                setLoading(false);
                console.log(result)
                setProducts(result.products.map(v =>
                    ({...v, price: {...v.price, amount: v.price.amount/100}, quantity: cartList.find(c => c.id === v.price.id).num})));
                setShipping(result.shipping);
        // eslint-disable-next-line
    })}, [])

    const cart = (() => {
        if (loading || products === null) {
            return (
                <Container className={classes.headline}>
                    <Fade
                        in={loading}
                        className={classes.center}
                        style={{
                            transitionDelay: loading ? '800ms' : '0ms',
                        }}
                        unmountOnExit
                    >
                        <CircularProgress />
                    </Fade>
                </Container>
            )
        } else {
            return <CartList onChange={handleCartNumChange} products={products} shipping={shipping}/>
        }
    })();

    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <Link to="/" className={classes.link}>
                        <IconButton color="inherit" edge="start" aria-label="tilbake">
                            <ArrowBack />
                        </IconButton>
                    </Link>
                </Toolbar>
            </AppBar>
            <Container>
                {cart}
                <Button onClick={handleCheckout} className={classes.order} variant="contained" color="primary">Kjøp</Button>
            </Container>
        </div>
    )
}

const CartList = (props) => {
    const classes = useStyles();
    return (
        <TableContainer>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2} align="center">Produkt</TableCell>
                        <TableCell align="center">Antall</TableCell>
                        <TableCell align="center">Enhetspris</TableCell>
                        <TableCell align="center">Pris</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.products.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell align="center"><img alt="" className={classes.img} src={row.image}/></TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">
                                <TextField
                                    className={classes.number}
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    value={row.quantity}
                                    onChange={e => props.onChange(e, row.id)}
                                />
                            </TableCell>
                            <TableCell align="center">{row.price.amount}</TableCell>
                            <TableCell align="center">{row.quantity*row.price.amount}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell rowSpan={3} colSpan={3} />
                        <TableCell align="center">Frakt:</TableCell>
                        <TableCell align="center">{props.shipping}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="center">Total:</TableCell>
                        <TableCell align="center">{props.products.reduce((sum, p) => sum + p.quantity*p.price.amount, 0) + props.shipping}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Cart;