import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {TableCell, Table, TableContainer, TableHead, TableRow, TableBody} from "@material-ui/core";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    img: {
        maxHeight: 100,
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
        variant: "ekstra vanlig",
        image: "/logo512.png",
        quantity: 5,
        price: 322
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
                    {products.map((row) => (
                        <TableRow>
                            <TableCell align="center"><img alt="" className={classes.img} src={row.image}/></TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">{row.variant}</TableCell>
                            <TableCell align="center">{row.quantity}</TableCell>
                            <TableCell align="center">{row.price}</TableCell>
                            <TableCell align="center">{row.quantity*row.price}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Cart;