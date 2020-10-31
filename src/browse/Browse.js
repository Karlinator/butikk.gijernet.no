import React, {useState} from "react";
import Feed from "./Feed";
import {makeStyles} from "@material-ui/core/styles";
import Controls from "./Controls";
import clsx from "clsx";
import {AppBar, CssBaseline, Drawer, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Clear, FilterList} from "@material-ui/icons";

const drawerWidth = 240;

const testData = {
    products: [
        {title: 'test', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test2', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test3', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test4', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test5', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test6', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test7', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test8', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test9', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
        {title: 'test10', subtitle: 'Lorem Ipsum', img: '/logo512.png'},
    ]
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
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
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
}));

const Browse = () => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
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
                    <Typography variant="h6" noWrap>
                        Gi Jernet Nettbutikk
                    </Typography>
                </Toolbar>
            </AppBar>
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
                <Controls/>
            </Drawer>
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                <Feed products={testData.products}/>
            </main>
        </div>
    )
}

export default Browse;