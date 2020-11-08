import React, {useEffect, useState} from "react";
import Feed from "./Feed";
import {makeStyles} from "@material-ui/core/styles";
import Controls from "./Controls";
import clsx from "clsx";
import {
    AppBar,
    Drawer,
    Hidden,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
    CircularProgress,
    Container,
    Fade, Badge
} from "@material-ui/core";
import {Clear, FilterList, ShoppingCart} from "@material-ui/icons";
import {Link} from "react-router-dom";
import firebase from "firebase";

const drawerWidth = 240;

const functions = firebase.app().functions('europe-west1')
if (process.env.REACT_APP_EMULATORS) {
    functions.useEmulator("localhost", 5001)
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerContainer: {
        overflow: 'auto',
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'left',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
        marginTop: 50
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
        marginTop: 50
    },
    headline: {
        flexGrow: 1,
    },
    link: {
        color: 'inherit',
    },
    center: {
        marginLeft: '40%',
        marginTop: 50,
    }

}));

const Browse = () => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [types, setTypes] = useState([]);
    const [products, setProducts] = useState(null)

    const [totalProductNum, setTotalProductNum] = useState(() => {
        const cart = JSON.parse(window.localStorage.getItem('cart'));
        return cart.reduce((total, item) => total + parseInt(item.num), 0);
    });
    const handleProductNumChange = () => {
        console.log(totalProductNum)
        setTotalProductNum(totalProductNum => totalProductNum + 1);
    }

    const handleFilter = (search, filter) => {
        setFeed(<Feed
            onAddProduct={handleProductNumChange}
            products={products.filter(v=> filter[v.type] && v.title.toLowerCase().includes(search.toLowerCase()))}/>);
    }

    const [feed, setFeed] = useState(
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
        </Container>);

    useEffect(() => {
        functions.httpsCallable('products')({descriptions: false})
            .then(
                result => {
                    setProducts(result.data.products)
                    setFeed(<Feed onAddProduct={handleProductNumChange} products={result.data.products}/>);
                    setTypes(result.data.types)
                    setLoading(false);
                },
                (error) => {
                    setLoading(false);
                    console.log(error)
                    setFeed(<span>{error.toString()}</span>);
                }
            )
    // eslint-disable-next-line
    }, []);



    const theme = useTheme();
    const small = useMediaQuery(theme.breakpoints.down("xs"));

    const handleDrawerToggle = () => {
        console.log(small);
        if (!small) {
            setOpen(!open);
        } else {
            setOpen(true);
            setOverlayOpen(!overlayOpen)
        }
    };

    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar)}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        className={clsx(classes.menuButton)}
                    >
                        <FilterList />
                    </IconButton>
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
            <Hidden smUp>
                <Drawer
                    className={classes.drawer}
                    variant="temporary"
                    anchor="left"
                    open={overlayOpen}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <Toolbar/>
                    <Toolbar className={classes.drawerHeader}>
                        <Typography
                            variant="h5"
                        >
                            Søkefilter
                        </Typography>
                        <IconButton
                            onClick={handleDrawerToggle}
                            edge="end"
                            className={classes.menuButton}
                        >
                            <Clear />
                        </IconButton>
                    </Toolbar>
                    {loading ? '' : <Controls types={types} onChange={handleFilter}/>}
                </Drawer>
            </Hidden>
            <Hidden only="xs">
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={open}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <Toolbar/>
                    <Toolbar className={classes.drawerHeader}>
                        <Typography
                            variant="h5"
                        >
                            Søkefilter
                        </Typography>
                        <IconButton
                            onClick={handleDrawerToggle}
                            edge="end"
                            className={classes.menuButton}
                        >
                            <Clear />
                        </IconButton>
                    </Toolbar>
                    {loading ? '' : <Controls types={types} onChange={handleFilter}/>}
                </Drawer>
            </Hidden>
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                {feed}
            </main>
        </div>
    )
}

export default Browse;