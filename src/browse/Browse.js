import React, {useState} from "react";
import Feed from "./Feed";
import {makeStyles} from "@material-ui/core/styles";
import Controls from "./Controls";
import clsx from "clsx";
import {
    AppBar,
    Badge,
    Drawer,
    Hidden,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {Clear, FilterList, ShoppingCart} from "@material-ui/icons";
import {Link} from "react-router-dom";

const drawerWidth = 240;


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
    center: {
        marginLeft: '40%',
        marginTop: 50,
    }

}));

const Browse = ( {products} ) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [types] = useState(products.types.map(v => v.type));
    const [filters, setFilters] = useState(products.types.reduce((a, key) => Object.assign(a, {[key.type]: true}), {}))
    const [search, setSearch] = useState('')
    const [totalProductNum, setTotalProductNum] = useState(() => {
        const cart = JSON.parse(window.localStorage.getItem('cart'));
        return cart.reduce((total, item) => total + parseInt(item.num), 0);
    });

    const handleProductNumChange = () => {
        console.log(totalProductNum)
        setTotalProductNum(totalProductNum => totalProductNum + 1);
    }
    const [feed, setFeed] = useState(<Feed onAddProduct={handleProductNumChange} products={products.products}/>);
    const handleChange = (id) => () => {
        setFilters(f => {
            const newFilters = {...f, [id]: !f[id]}
            setFeed(<Feed
                onAddProduct={handleProductNumChange}
                products={products.products.filter(v=> newFilters[v.type] && v.title.toLowerCase().includes(search.toLowerCase()))}
            />);
            return newFilters
        })

    }
    const handleSearch = (e) => {
        setSearch(e.target.value)
        setFeed(<Feed
            onAddProduct={handleProductNumChange}
            products={products.filter(v=> filters[v.type] && v.title.toLowerCase().includes(e.target.value.toLowerCase()))}
        />);

    }



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
                    <IconButton
                        component={Link}
                        to="/cart"
                        color="inherit"
                        aria-label="handlevogn"
                        edge="end"
                    >
                        <Badge color="secondary" badgeContent={totalProductNum}>
                            <ShoppingCart />
                        </Badge>
                    </IconButton>
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
                    {<Controls types={types} filters={filters} search={search} handleChange={handleChange} handleSearch={handleSearch}/>}
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
                    {<Controls types={types} filters={filters} search={search} handleChange={handleChange} handleSearch={handleSearch}/>}
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