import React, {useState} from "react";
import {
    Button,
    Card, CardActionArea, CardActions, CardContent, CardMedia,
    Grid,
    Typography
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {AddShoppingCart} from "@material-ui/icons";
import {Link} from "react-router-dom";
//import {analytics} from "../firebase";
import { trackWindowScroll, LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';


const useStyles = makeStyles((theme) => ({
    gridList: {
        width: '100%'
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    img: {
        height: '180px',
    },
    clickable: {
        cursor: 'pointer',
    },
    titleBar: {
        backgroundColor: theme.palette.background.paper

    },
    title: {
        color: theme.palette.text.primary
    },
    tile: {
        height: '100%',
    },
    actionIcon: {
        marginRight: 5,
    },
    price: {
        flexGrow: 1,
        marginLeft: 8,
    },
}));

const Feed = ({products, onAddProduct, scrollPosition}) => {
    const classes = useStyles();
    const [, setCartList] = useState(JSON.parse(window.localStorage.getItem('cart')));

    const handleAddToCart = (e, id) => {
        e.stopPropagation();
        onAddProduct();
        //const product = products.find(i => i.id === id)
        let cart = JSON.parse(window.localStorage.getItem('cart'));
        const i = cart.findIndex(p => p.id === id);
        if (i !== -1) {
            cart[i].num = parseInt(cart[i].num)+1;
        } else {
            cart.push({id: id, num: 1});
        }
        setCartList(cart);
        // analytics.logEvent('add_to_cart', {
        //     item_id: id,
        //     item_name: product.title,
        //     price: product.prices.filter(v => !v.transform)[0].amount/100,
        //     currency: 'nok',
        //     quantity: 1
        // })
        const cartJSON = JSON.stringify(cart);
        console.log(cartJSON)
        window.localStorage.setItem('cart', cartJSON);
    }


    return (
        <Grid container spacing={3}>
            {products.map((tile) => (
                <Grid item xs={12} md={6} lg={4} xl={3} key={tile.id}>
                    <LazyLoadComponent threshold={300} scrollPosition={scrollPosition}>
                        <Card className={classes.tile}>
                            <CardActionArea
                                component={Link}
                                to={'/'+tile.id}
                            >
                                <CardMedia
                                    className={classes.img}
                                    image={tile.images.length === 1 ? tile.images[0] : tile.images.filter(i => !i.includes('stripe.com')).map(i => {
                                        const n = i.lastIndexOf('/')
                                        return i.slice(0, n+1) + "thumb_" + i.slice(n+1)
                                    })[0]}
                                    alt={tile.alt}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5">
                                        {tile.title}
                                    </Typography>
                                    <Typography variant="body1">
                                        {tile.subtitle}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <Typography variant="h5" className={classes.price}>
                                    {'kr '+tile.prices[0].amount/100+',-'}
                                </Typography>
                                <Button
                                    color="primary"
                                    onClick={e => handleAddToCart(e, tile.id)}
                                >
                                    <AddShoppingCart className={classes.actionIcon}/> Legg i handlekurv
                                </Button>
                            </CardActions>
                        </Card>
                    </LazyLoadComponent>
                </Grid>
            ))}
        </Grid>
    )
}

export default trackWindowScroll(Feed);