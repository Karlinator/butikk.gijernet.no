import React from "react";
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
    TextField, Button,
} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    img: {
        maxHeight: 100,
    },
    number: {
        width: 70,
    }
});

const products = [
    {
        name: "Test",
        variant: "vanlig",
        image: "/logo512.png",
        quantity: 5,
        price: 200
    },
    {
        name: "Test2",
        variant: "vanlig",
        image: "/logo512.png",
        quantity: 5,
        price: 152
    },
    {
        name: "Test3",
        variant: "ekstraordinær",
        image: "/logo512.png",
        quantity: 7,
        price: 200
    },
    {
        name: "Test4",
        variant: "vanlig",
        image: "/logo512.png",
        quantity: 69,
        price: 420
    },
]


const Cart = () => {
    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton color="inherit" edge="start" aria-label="tilbake">
                        <ArrowBack />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container>
                <CartList products={products} shipping={149} />
                <Button variant="contained" color="primary">Kjøp</Button>
            </Container>
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
                        <TableCell align="center">Variant</TableCell>
                        <TableCell align="center">Antall</TableCell>
                        <TableCell align="center">Enhetspris</TableCell>
                        <TableCell align="center">Pris</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.products.map((row) => (
                        <TableRow>
                            <TableCell align="center"><img alt="" className={classes.img} src={row.image}/></TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">{row.variant}</TableCell>
                            <TableCell align="center">
                                <TextField
                                    className={classes.number}
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    value={row.quantity}
                                />
                            </TableCell>
                            <TableCell align="center">{row.price}</TableCell>
                            <TableCell align="center">{row.quantity*row.price}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell rowSpan={3} colSpan={4} />
                        <TableCell align="center">Frakt:</TableCell>
                        <TableCell align="center">{props.shipping}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="center">Total:</TableCell>
                        <TableCell align="center">{props.products.reduce((sum, p) => sum + p.quantity*p.price, 0)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Cart;