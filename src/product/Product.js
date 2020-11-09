import React, {useEffect, useState} from "react";
import {
    AppBar,
    Container,
    GridList,
    GridListTile,
    IconButton,
    Toolbar,
    Typography, Grid, Paper, TextField, Button, Hidden, Badge, Fade, CircularProgress, useMediaQuery, useTheme
} from "@material-ui/core";
import {AddShoppingCart, ArrowBack, ShoppingCart} from "@material-ui/icons"
import {makeStyles} from "@material-ui/core/styles";
import {
    useParams,
    Link
} from "react-router-dom";
import {analytics, functions} from "../firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
        height: 'auto',
    },
    title: {
        color: theme.palette.primary.light,
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    img: {
        height: '100%',
        width: 'auto',
        cursor: 'pointer'
    },
    coverImg: {
        width: '100%',
        height: 'auto',
    },
    forms: {
        marginTop: 25,
        marginBottom: 25,
        marginRight: 40
    },
    link: {
        color: 'inherit',
    },
    headline: {
        flexGrow: 1,
    },
    bottom: {
        marginBottom: 300,
    },
    center: {
        marginLeft: '45%',
        marginTop: 50,
    }
}));

const ProductPage = () => {
    const classes = useStyles();
    const [totalProductNum, setTotalProductNum] = useState(() => {
        const cart = JSON.parse(window.localStorage.getItem('cart'));
        return cart.reduce((total, item) => total + parseInt(item.num), 0);
    });
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('')
    const handleProductNumChange = () => {
        setTotalProductNum(() => {
                const cart = JSON.parse(window.localStorage.getItem('cart'));
                return cart.reduce((total, item) => total + parseInt(item.num), 0);
            });
    }
    const {id} = useParams();


    useEffect(() => {
        functions.httpsCallable('productDetails')({id: id})
            .then(res => {
                setLoading(false)
                if (res.data.code === 200) {
                    setProduct(res.data);
                } else {
                    console.log(res.data.message)
                    setError(res.data.message)
                }
            })
    // eslint-disable-next-line
    }, [])

    const content = (() => {
        if ((loading || product === null) && !error) {
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
                        <CircularProgress/>
                    </Fade>
                </Container>
            )
        } else if (error !== '') {
            return <Container className={classes.headline}>
                    <Typography className={classes.center} variant="body1">
                        Det skjedde en feil: {error}
                    </Typography>
                </Container>
        } else {
            return <Product onChange={handleProductNumChange} product={product} />
        }
    })();

    return(
        <div className={classes.bottom}>
            <AppBar position="sticky">
                <Toolbar>
                    <Link to="/" className={classes.link}>
                        <IconButton color="inherit" edge="start" aria-label="tilbake">
                            <ArrowBack />
                        </IconButton>
                    </Link>
                    <Typography variant="h6" noWrap className={classes.headline}>
                        Gi Jernet Nettbutikk
                    </Typography>
                    <Link to="/cart" className={classes.link}>
                        <IconButton
                            color="inherit"
                            aria-label="handlevogn"
                            edge="end"
                        >
                            <Badge color="secondary" badgeContent={totalProductNum}>
                                <ShoppingCart />
                            </Badge>
                        </IconButton>
                    </Link>
                </Toolbar>
            </AppBar>
            {content}
        </div>
    )
}

const Product = (props) => {
    const classes = useStyles();

    const [selected, setSelected] = useState(props.product.images.filter(i => !i.includes('stripe.com'))[0] || props.product.images[0]);

    const handleSelectVariant = (e, img) => {
        setSelected(img);
    }
    const theme = useTheme();
    const size = {
        xl: useMediaQuery(theme.breakpoints.up('xl')),
        lg: useMediaQuery(theme.breakpoints.up('lg')),
        md: useMediaQuery(theme.breakpoints.up('md')),
        sm: useMediaQuery(theme.breakpoints.up('sm')),
    }
    const getGridListHeight = () => {
        if (size.md) {
            return 180
        }
        if (size.sm) {
            return 130
        }
        return 80

    }

    return (
        <Container className={classes.root}>
            <Container>
                <img className={classes.coverImg} alt={props.product.title} src={selected} />
            </Container>
            {props.product.images.length > 1 ? <GridList classes={{root: classes.gridList}} cellHeight={getGridListHeight()} cols={props.product.images.length - 1}>
                {props.product.images.filter(i => !i.includes('stripe.com')).map((img) => {
                    const n = img.lastIndexOf('/')
                    const thumb = img.slice(0, n+1) + 'thumb_' + img.slice(n+1)
                    return    (
                        <GridListTile
                            cols={1}
                            rows={0.8}
                            key={img}
                            onClick={e => handleSelectVariant(e, img)}
                        >
                            <img className={classes.img} alt="" src={thumb} />
                        </GridListTile>
                )})}
            </GridList> : ''}
            <Container>
                <Typography variant="h3" component="h1">{props.product.name}</Typography>
                <Typography variant="h5" component="h3">{props.product.description}</Typography>
                <Typography variant="h4" component="h2">kr {props.product.price.amount/100}</Typography>
            </Container>
            <Grid container spacing={3}>
                <Hidden mdUp>
                    <Grid item xs={12}>
                        <Controls onChange={props.onChange} id={props.product.price.id} />
                    </Grid>
                </Hidden>
                <Grid item xs={12} md={8}>
                    <Typography variant="body1">
                        {props.product.type_description}
                    </Typography>
                    <Typography variant="body1">
                        {props.product.longDescription}
                    </Typography>
                </Grid>
                <Hidden smDown>
                    <Grid item md={4}>
                        <Controls selected={selected} onChange={props.onChange} id={props.product.id} />
                    </Grid>
                </Hidden>
            </Grid>
        </Container>
    )
}

const Controls = (props) => {
    const classes = useStyles();

    const [num, setNum] = useState(0);

    const handleNumChange = (event) => {
        setNum(event.target.value)
    }

    const handleAddToCart = () => {
        let cart = JSON.parse(window.localStorage.getItem('cart'));
        const i = cart.findIndex(p => p.id === props.id);
        if (i !== -1) {
            cart[i].num = parseInt(cart[i].num) + parseInt(num);
        } else {
            cart.push({id: props.id, num: num});
        }
        const cartJSON = JSON.stringify(cart);
        console.log(cartJSON)
        window.localStorage.setItem('cart', cartJSON);
        analytics.logEvent('add_to_cart', {
            item_id: props.id,
            item_name: props.title,
            price: props.prices.filter(v => !v.transform)[0].amount/100,
            currency: 'nok',
            quantity: num
        })
        props.onChange();
    }

    return (
        <Paper variant="outlined">
            <Container>
                <TextField
                    variant="outlined"
                    type="number"
                    label="Antall"
                    size="small"
                    value={num}
                    onChange={handleNumChange}
                    className={classes.forms}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCart/>}
                    className={classes.forms}
                    onClick={handleAddToCart}
                >
                    Legg i handlevogn
                </Button>
            </Container>
        </Paper>
    )
}

export default ProductPage;