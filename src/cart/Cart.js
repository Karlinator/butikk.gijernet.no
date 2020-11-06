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
    TextField,
    Button,
    Fade,
    CircularProgress,
    Modal,
} from "@material-ui/core";
import {ArrowBack, RemoveShoppingCart} from "@material-ui/icons";
import {Link} from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';

const useStyles = makeStyles((theme) => ({
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
    },
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

function rand() {
    return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
    const top = 40 + rand();
    const left = 40 + rand();

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const Cart = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState(null);
    const [shipping, setShipping] = useState(0);

    // Error modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStyle] = useState(getModalStyle());
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const handleClose = () => {
        setModalOpen(false);
    }


    const handleCartNumChange = (e, id) => {
        if (e.target.value >= 0 && e.target.value !== '') {
            console.log(id)
            const p = products.map(v => ({...v, quantity: v.id !== id ? v.quantity : e.target.value}));
            setProducts(p);
            console.log(p)
            window.localStorage.setItem('cart', JSON.stringify(p.map(v => ({id: v.id, num: v.quantity}))))
        }
    }

    const handleRemoveFromCart = (e, id) => {
        const p = products.filter(v => v.id !== id)
        setProducts(p);
        window.localStorage.setItem('cart', JSON.stringify(p.map(v => ({id: v.id, num: v.quantity}))))
    }

    const handleCheckout = async () => {
        const stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY)
        const prices = products.map(v => (calculateBestPrice(v.prices, v.quantity)))
        console.log(prices)
        let request = [];
        prices.forEach(v => {
            request.push({
                price: v.id,
                quantity: parseInt(v.packs),
            })
            request.push({
                price: v.basePrice.id,
                quantity: parseInt(v.singles),
            })
        });
        request = request.filter(v => v.quantity > 0)
        if (request.length === 0) {
            setModalTitle("Du kan ikke kjøpe ingenting!");
            setModalContent("Eller, du kan det, men da får du ikke betale")
            setModalOpen(true);
            return;
        }

        const response = await fetch('/api/checkout', {
            method: 'POST',
            body: JSON.stringify(request)
        });
        const session = await response.json();


        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        })

        if (result.error) {
            window.alert(result.error.message);
        }
    }

    // Gives the best price by combination of whatever packages are available.
    // Does not reliably deal with more than one package price.
    // Will not, say, combine 3x10+2x6+3x1 because it  would do 4x10+5x1.
    const calculateBestPrice = (prices, num) => {
        console.log(prices)
        console.log(num)
        if (prices.length === 1) {
            return {...prices[0], packs: 0, singles: num, basePrice: {...prices[0]}}
        } else {
            let best = null;
            let bestPrice = Infinity;
            let basePrice = prices.filter(v => !v.transform)[0];
            prices.forEach(v => {
                //console.log(bestPrice)
                if (v.transform) {
                    const turningPoint = Math.ceil(v.amount/basePrice.amount)
                    let packs = Math.floor(num/v.transform.divide_by)
                    let singles = num % v.transform.divide_by
                    if (singles >= turningPoint) {
                        packs += 1;
                        singles = 0;
                    }
                    const price = packs*v.amount + singles*basePrice.amount
                    console.log(price)
                    console.log(bestPrice)
                    if ( price < bestPrice) {
                        best = {...v, packs: packs, singles: singles, basePrice: basePrice}
                        bestPrice = price
                    }
                } else {
                    //console.log(v.amount*num)
                    if (v.amount*num < bestPrice) {
                        best = {...v, packs: 0, singles: num, basePrice: basePrice}
                        bestPrice = v.amount*num
                    }
                }
            })
            return best;
        }
    }

    useEffect(() => {
        const cartList = JSON.parse(window.localStorage.getItem('cart'));
        const productList = cartList.map(item => item.id);
        fetch('/api/cartDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({productList: productList})
        })
            .then(result => result.json())
            .then(result => {
                setLoading(false);
                console.log(result)
                setProducts(result.products.map(v =>
                    ({...v, quantity: cartList.find(c => c.id === v.id).num})));
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
            return <CartList
                onRemove={handleRemoveFromCart}
                onChange={handleCartNumChange}
                products={products.map(v => ({...v, price: calculateBestPrice(v.prices, v.quantity)}))}
                shipping={shipping}/>
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
            <Modal
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={modalStyle} className={classes.paper}>
                    <h2 id="simple-modal-title">{modalTitle}</h2>
                    <p id="simple-modal-description">
                        {modalContent}
                    </p>
                </div>
            </Modal>
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
                        <TableCell align="center">Fjern</TableCell>
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
                            <TableCell align="center">{row.price.transform ? row.price.amount/100+" pr "+row.price.transform.divide_by : row.price.amount/100}</TableCell>
                            <TableCell align="center">{(row.price.singles * row.price.basePrice.amount + row.price.packs * row.price.amount)/100}</TableCell>
                            <TableCell align="center">
                                <IconButton
                                    onClick={e => props.onRemove(e, row.id)}
                                >
                                    <RemoveShoppingCart />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell rowSpan={3} colSpan={3} />
                        <TableCell align="center">Frakt:</TableCell>
                        <TableCell align="center">{props.shipping}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="center">Total:</TableCell>
                        <TableCell align="center">{props.products.reduce((total, v) => total + (parseInt(v.price.singles) * parseInt(v.price.basePrice.amount) + parseInt(v.price.packs) * parseInt(v.price.amount)), 0)/100}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Cart;