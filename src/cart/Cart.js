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
    Modal, useTheme, useMediaQuery, Hidden, Typography, Grid,
} from "@material-ui/core";
import {ArrowBack, RemoveShoppingCart} from "@material-ui/icons";
import { green } from '@material-ui/core/colors';
import {Link} from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import {analytics, functions} from "../firebase";
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 200,
    },
    img: {
        maxHeight: 100,
    },
    smallImg: {
        maxHeight: 80,
    },
    noBorder: {
        borderBottom: 'none',
    },
    noPadding: {
        paddingLeft: 0,
        paddingRight: 0,
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
        justifyContent: 'center',
        width: 250,
        marginTop: 20,
    },
    back: {
        flexGrow: 1,
    },
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
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
    const [loadingSubmit, setLoadingSubmit] = useState(false);
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

    const theme = useTheme()
    const small = useMediaQuery(theme.breakpoints.down('sm'))


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
        setLoadingSubmit(true)
        analytics.logEvent('begin_checkout', {currency: 'nok', items: products.map(v => ({item_id: v.id, item_list_name: v.title, item_category: v.type, quantity: v.quantity, price: v.prices.filter(i => !i.transform)[0].amount/100})), value: prices.reduce((t, c) => t+c.amount)/100})
        console.log(prices)
        let request = [];
        prices.forEach(v => {
            request.push({
                price: v.price.id,
                quantity: v.price.packs,
            })
            request.push({
                price: v.price.basePrice.id,
                quantity: parseInt(v.price.singles),
            })
        });
        request = request.filter(v => v.quantity > 0)
        if (request.length === 0) {
            setModalTitle("Du kan ikke kjøpe ingenting!");
            setModalContent("Eller, du kan det, men da får du ikke betale")
            setModalOpen(true);
            return;
        }

        const response = await functions.httpsCallable('checkout')(request);


        const result = await stripe.redirectToCheckout({
            sessionId: response.data.id,
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
            return {price: {...prices[0], packs: 0, singles: num, basePrice: {...prices[0]}}, best: prices[0].amount * num}
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
            return {price: best, amount: bestPrice};
        }
    }

    useEffect(() => {
        const cartList = JSON.parse(window.localStorage.getItem('cart'));
        const productList = cartList.map(item => item.id);

        functions.httpsCallable('cartDetails')({productList: productList})
            .then(result => {
                const list = result.data.products.map(v => ({...v, quantity: cartList.find(c => c.id === v.id).num}))
                analytics.logEvent('view_cart', {items: result.data.products.map(v => v.id), currency: 'nok', value: list.reduce((total, current) => total + calculateBestPrice(current.prices, current.quantity).amount)})
                setLoading(false);
                console.log(result.data)
                setProducts(list);
                setShipping(result.data.shipping);
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
            <Container className={small ? classes.noPadding : null}>
                <div>{cart}</div>
                <Grid justify={small ? 'center' : 'space-between'} container>
                    <Grid item>
                        <Button
                            className={clsx(classes.order, classes.back)}
                            variant="contained"
                            color="default"
                            component={Link}
                            to="/"
                        >
                            Fortsett å handle
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={handleCheckout}
                            className={classes.order}
                            variant="contained"
                            color="primary"
                            disabled={loadingSubmit}
                        >
                            Gå til kassen
                            {loadingSubmit && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </Button>
                    </Grid>
                </Grid>
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
    const theme = useTheme()
    const small = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <TableContainer>
            <Table size={small ? 'small' : 'medium'} className={small ? clsx(classes.table, classes.noPadding) : classes.table}>
                <Hidden smDown><TableHead>
                    <TableRow>
                        <TableCell colSpan={2} align="center">Produkt</TableCell>
                        <TableCell align="center">Antall</TableCell>
                        <TableCell align="center">Enhetspris</TableCell>
                        <TableCell align="center">Pris</TableCell>
                        <TableCell align="center">Fjern</TableCell>
                    </TableRow>
                </TableHead></Hidden>
                <Hidden mdUp><TableHead>
                    <TableRow>
                        <TableCell colSpan={2} align="center"><Typography variant="subtitle1">Handlevogn</Typography></TableCell>
                    </TableRow>
                </TableHead></Hidden>
                <TableBody>
                    {props.products.map((row) => (
                        <TableRow key={row.id}>
                            <Hidden smDown><CartRowWide row={row} onChange={props.onChange} onRemove={props.onRemove}/></Hidden>
                            <Hidden mdUp><CartRowNarrow row={row} onChange={props.onChange} onRemove={props.onRemove}/></Hidden>
                        </TableRow>
                    ))}
                    <Hidden smDown>
                        <TableRow>
                            <TableCell rowSpan={3} colSpan={3} />
                            <TableCell align="center">Frakt:</TableCell>
                            <TableCell align="center">{props.shipping}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">Total:</TableCell>
                            <TableCell align="center">{props.products.reduce((total, v) => total + v.price.best, 0)/100}</TableCell>
                        </TableRow>
                    </Hidden>
                    <Hidden mdUp>
                        <TableRow>
                            <TableCell align="center">Frakt:</TableCell>
                            <TableCell align="center">{props.shipping}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">Total:</TableCell>
                            <TableCell align="center">{props.products.reduce((total, v) => total + v.price.best, 0)/100}</TableCell>
                        </TableRow>
                    </Hidden>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const insertThumb = (img) => {
    const n = img.lastIndexOf('/')
    return img.slice(0, n+1) + 'thumb_' + img.slice(n+1)
}

const CartRowWide = (props) => {
    const row = props.row
    const classes = useStyles();
    return (
        <>
            <TableCell align="center"><img alt="" className={classes.img} src={row.images.filter(i => !i.includes('stripe.com')).length > 0 ? insertThumb(row.images.filter(i => !i.includes('stripe.com'))[0]) : row.images[0]}/></TableCell>
            <TableCell align="center">
                <Typography variant="body1">{row.name}</Typography>
                <Typography variant="body2">{row.description}</Typography>
            </TableCell>
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
            <TableCell align="center">{row.price.transform ? row.price.amount/100+" pr "+row.price.transform.divide_by : row.price.price.amount/100}</TableCell>
            <TableCell align="center">{row.price.best/100}</TableCell>
            <TableCell align="center">
                <IconButton
                    onClick={e => props.onRemove(e, row.id)}
                >
                    <RemoveShoppingCart />
                </IconButton>
            </TableCell>
        </>
    )
}

const CartRowNarrow = (props) => {
    const classes = useStyles()
    const row = props.row
    return (
        <>
            <TableCell className={classes.noPadding} colSpan={4}>
                <TableRow>
                    <TableCell padding="none" className={classes.noBorder} align="center"><img alt="" className={classes.smallImg} src={row.images.filter(i => !i.includes('stripe.com')).length > 0 ? insertThumb(row.images.filter(i => !i.includes('stripe.com'))[0]) : row.images[0]}/></TableCell>
                    <TableCell padding="none" colSpan={3} className={classes.noBorder} align="center">
                        <Typography variant="body1">{row.name}</Typography>
                        <Typography variant="body2">{row.description}</Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell padding="none" width={50} className={classes.noBorder} align="center">
                        <TextField
                            className={classes.number}
                            variant="outlined"
                            type="number"
                            size="small"
                            value={row.quantity}
                            onChange={e => props.onChange(e, row.id)}
                        />
                    </TableCell>
                    <TableCell padding="none" className={classes.noBorder} align="center"><Typography variant="body2">kr{row.price.transform ? row.price.amount/100+" pr "+row.price.transform.divide_by : row.price.price.amount/100 + ' pr stk'}</Typography></TableCell>
                    <TableCell padding="none" className={classes.noBorder} align="center">
                        <Typography variant="body2">
                            kr{row.price.best/100}
                            <IconButton
                                onClick={e => props.onRemove(e, row.id)}
                            >
                                <RemoveShoppingCart />
                            </IconButton>
                        </Typography>
                    </TableCell>
                </TableRow>
            </TableCell>
        </>
    )
}

export default Cart;