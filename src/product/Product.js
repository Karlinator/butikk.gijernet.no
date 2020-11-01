import React, {useState} from "react";
import {
    AppBar,
    Container,
    GridList,
    GridListTile,
    IconButton,
    Toolbar,
    GridListTileBar,
    Typography, Grid, Paper, TextField, Button, Hidden, Badge
} from "@material-ui/core";
import {AddShoppingCart, ArrowBack, ShoppingCart} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {
    useParams,
    Link
} from "react-router-dom";

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
        width: '1000',
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
    }
}));

const product = {
    title: "Test",
    image: "/logo512.png",
    price: 420,
    variants: [
        {
            id: "dfjkasljfdasl",
            title: "type 1",
            img: "/logo512.png"
        },
        {
            id: "gsdfgersa",
            title: "type 2",
            img: "/logo512.png"
        },
        {
            id: "fsd",
            title: "type 3",
            img: "/logo512.png"
        },
        {
            id: "hgsdfg",
            title: "type 4",
            img: "/logo512.png"
        },
        {
            id: "gsdfjhdfghfggersa",
            title: "type 5",
            img: "/logo512.png"
        },
        {
            id: "das",
            title: "type 6",
            img: "/logo512.png"
        },
        {
            id: "fsdhgrrhdfg",
            title: "type 7",
            img: "/logo512.png"
        },
        {
            id: "gsdfjhdfggdfhfdshfggersa",
            title: "type 8",
            img: "/logo512.png"
        },
    ]
}

const ProductPage = () => {
    const classes = useStyles();
    const [totalProductNum, setTotalProductNum] = useState(() => {
        const cart = JSON.parse(window.localStorage.getItem('cart'));
        return cart.reduce((total, item) => total + parseInt(item.num), 0);
    });
    const handleProductNumChange = () => {
        setTotalProductNum(() => {
                const cart = JSON.parse(window.localStorage.getItem('cart'));
                return cart.reduce((total, item) => total + parseInt(item.num), 0);
            });
    }
    let {id} = useParams();
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
            {id}
            <Product onChange={handleProductNumChange} product={product} />
        </div>
    )
}

const Product = (props) => {
    const classes = useStyles();

    const [selected, setSelected] = useState(props.product.variants[0].id);

    const handleSelectVariant = (e, id) => {
        setSelected(id);
    }

    return (
        <Container className={classes.root}>
            <Container>
                <img className={classes.coverImg} alt={props.product.title} src={props.product.image} />
            </Container>
            <GridList className={classes.gridList}>
                {props.product.variants.map((tile) => (
                    <GridListTile
                        cols={0.5}
                        rows={0.8}
                        key={tile.id}
                        onClick={e => handleSelectVariant(e, tile.id)}
                    >
                        <img className={classes.img} alt="" src={tile.img} />
                        <GridListTileBar
                            title={tile.title}
                            classes={{
                                root: classes.titleBar,
                                title: classes.title,
                            }}
                        />
                    </GridListTile>
                ))}
            </GridList>
            <Container>
                <Typography variant="h3" component="h1">{props.product.title}</Typography>
                <Typography variant="h4" component="h2">kr{props.product.price}</Typography>
            </Container>
            <Grid container spacing={3}>
                <Hidden mdUp>
                    <Grid item xs={12}>
                        <Controls id={selected} />
                    </Grid>
                </Hidden>
                <Grid item xs={12} md={8}>
                    <Typography variant="body1">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at viverra mi, ac dapibus lorem. Sed viverra tempor nulla vel maximus. Vestibulum quis commodo neque. Quisque quis nisi pellentesque sapien maximus sodales dignissim id justo. Vestibulum sed imperdiet ex, eu convallis elit. Cras vitae libero cursus, tincidunt ipsum eu, eleifend nulla. Nullam eu ligula id ipsum tristique porta sit amet ac eros. Phasellus vestibulum lectus in porta eleifend. Cras eget volutpat tellus. Morbi facilisis risus ac odio eleifend consequat.
                    </Typography>
                </Grid>
                <Hidden smDown>
                    <Grid item md={4}>
                        <Controls onChange={props.onChange} id={selected} />
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