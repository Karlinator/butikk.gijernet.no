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
    CircularProgress, Container, Button, IconButton
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Delete} from "@material-ui/icons";

const useStyles = makeStyles(() => ({
    headline: {
        flexGrow: 1,
    },
    center: {
        marginLeft: '40%',
        marginTop: 50,
    },
    imgList: {
        width: 80
    },
    description: {
        width: '100%'
    }
}))


const Admin = () => {
    const classes = useStyles();
    const [products, setProducts] = useState();
    const [loading, setLoading] = useState(true);
    const [pictures, setPictures] = useState({})

    const handleAddPicture = (id) => (event) => {
        // event.target.files[0] is the file that was added.
        // URL.CreateObjectURL is user to allow local preview before upload.
        // The file attribute is what will actually be uploaded to the server.
        setPictures({...pictures, [id]: [...pictures[id], {file: event.target.files[0], uri: URL.createObjectURL(event.target.files[0])}]})
    }

    const handleRemovePicture = (uri, id) => () => {
        setPictures({...pictures, [id]: [...pictures[id].filter(i => i.uri !== uri)]});
    }

    useEffect(() => {
        fetch('/api/products')
            .then(v => v.json())
            .then(v => {
                // { [productId]: [{file: null, uri: "cloud.storage.whatever/file"}]}
                setProducts(v.products);
                setPictures(v.products.reduce((a, key) => Object.assign(a, { [key.id]: key.images.filter(i => !i.includes('stripe.com')).map(i => ({file: null, uri: i}))}), {}));
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
    return (
        <div>
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
                                <TableCell>
                                    {pictures[v.id].map(i => (
                                        <div>
                                            <img
                                                alt=""
                                                className={classes.imgList}
                                                src={i.uri}
                                            />
                                            <IconButton
                                                onClick={handleRemovePicture(i.uri, v.id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </div>
                                    ))}
                                    <Button
                                        variant="contained"
                                        component="label"
                                    >
                                        Nytt bilde
                                        <input
                                            type="file"
                                            style={{display: 'none'}}
                                            onChange={handleAddPicture(v.id)}
                                            multiple
                                        />
                                    </Button>
                                </TableCell>
                                <TableCell align="center">
                                    <TextField
                                        variant="filled"
                                        multiline
                                        value={v.longDescription}
                                        className={classes.description}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default Admin;