import React, {useState} from "react";
import {GridList, GridListTile, GridListTileBar, IconButton, useMediaQuery, useTheme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {AddShoppingCart, ShoppingCart} from "@material-ui/icons";
import {Link} from "react-router-dom";
import { useHistory } from 'react-router-dom';


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
        height: 'auto%',
        width: '100%'
    },
    clickable: {
        cursor: 'pointer',
    }
}));

const Feed = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const [cartList, setCartList] = useState(JSON.parse(window.localStorage.getItem('cart')));

    const theme = useTheme();
    const size = {
        xl: useMediaQuery(theme.breakpoints.up('xl')),
        lg: useMediaQuery(theme.breakpoints.up('lg')),
        md: useMediaQuery(theme.breakpoints.up('md')),
        sm: useMediaQuery(theme.breakpoints.up('sm')),
    }

    const getGridListCols = () => {
        if (size.xl) {
            return 5;
        }

        if (size.lg) {
            return 4;
        }

        if (size.md) {
            return 3;
        }

        if (size.sm) {
            return 2;
        }

        return 1;
    }


    const handleGotoProduct = (e, id) => {
        history.push('/'+id);
    }

    const handleAddToCart = (e, id) => {
        e.stopPropagation();
        props.onAddProduct();
        let cart = JSON.parse(window.localStorage.getItem('cart'));
        const i = cart.findIndex(p => p.id === id);
        if (i !== -1) {
            cart[i].num = parseInt(cart[i].num) + 1;
        } else {
            cart.push({id: id, num: 1});
        }
        setCartList(cart);
        const cartJSON = JSON.stringify(cart);
        console.log(cartJSON)
        window.localStorage.setItem('cart', cartJSON);
    }


    return (
        <GridList cols={getGridListCols()} spacing={16} className={classes.gridList}>
            {props.products.map((tile) => (
                <GridListTile>
                    <Link to={'/'+tile.id}>
                        <img className={classes.img} src={tile.images[0]}  alt={tile.alt}/>
                    </Link>
                        <GridListTileBar
                            id={tile.id}
                            title={tile.title+(tile.subtitle !== null ? ' – '+tile.subtitle : '')}
                            subtitle={cartList.find(v => tile.prices.id === v.id) ? <><ShoppingCart/> i handlevogn</> : 'kr '+tile.prices[0].amount/100}
                            className={classes.clickable}
                            onClick={e => handleGotoProduct(e, tile.id)}
                            actionIcon={
                                <IconButton
                                    className={classes.icon}
                                    onClick={e => handleAddToCart(e, tile.id)}
                                >
                                    <AddShoppingCart />
                                </IconButton>
                            }
                        />
                </GridListTile>
            ))}
        </GridList>
    )
}

export default Feed;