import React from "react";
import {GridList, GridListTile, GridListTileBar, IconButton} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {AddShoppingCart} from "@material-ui/icons";
import {Link} from "react-router-dom";

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
    }
}));

const Feed = (props) => {
    const classes = useStyles();
    return (
        // TODO: Make this scale columns by screen size.
        <GridList cols={4} spacing={16} className={classes.gridList}>
            {props.products.map((tile) => (
                <GridListTile>
                    <Link to={'/'+tile.id}>
                        <img className={classes.img} src={tile.img}  alt={tile.alt}/>
                        <GridListTileBar
                            title={tile.title}
                            subtitle={tile.subtitle}
                            actionIcon={
                                <IconButton className={classes.icon}>
                                    <AddShoppingCart />
                                </IconButton>
                            }
                        />
                    </Link>
                </GridListTile>
            ))}
        </GridList>
    )
}

export default Feed;