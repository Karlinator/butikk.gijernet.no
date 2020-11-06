import React, {useEffect, useState} from "react";
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Fade,
    TextField,
    CircularProgress, Container
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const classes = makeStyles(() => ({
    headline: {
        flexGrow: 1,
    },
    center: {
        marginLeft: '40%',
        marginTop: 50,
    }
}))


const Admin = () => {
    const [products, setProducts] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(v => v.json())
            .then(v => {
                setProducts(v.products);
                setLoading(false);
            })
    }, [])
    if (loading) {
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
                    <CircularProgress />
                </Fade>
            </Container>
        )
    }
    console.log(products);
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Produkt</TableCell>
                        <TableCell>Bilder</TableCell>
                        <TableCell>Beskrivelse</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map(v => (
                        <TableRow key={v.id}>
                            <TableCell>{v.title}</TableCell>
                            <TableCell>{v.images}</TableCell>
                            <TableCell>
                                <TextField
                                    variant="filled"
                                    multiline
                                    value={v.longDescription}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Admin;