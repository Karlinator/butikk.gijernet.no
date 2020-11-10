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
    CircularProgress, Container, Button, IconButton, Typography
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Delete, Image, Save} from "@material-ui/icons";
import firebase, {storage, firebaseConfig, functions, auth} from "../firebase";
import {FirebaseAuthConsumer, FirebaseAuthProvider} from "@react-firebase/auth";
import {green} from "@material-ui/core/colors";

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
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))


const Admin = () => {
    const classes = useStyles();
    const [products, setProducts] = useState(null);
    const [credentials, setCredentials] = useState({username: '', password: ''})
    const [loading, setLoading] = useState(true);
    const [pictures, setPictures] = useState({})
    const [types, setTypes] = useState(null)
    const [waiting, setWaiting] = useState(false)

    const handleAddPicture = (id) => (event) => {
        // event.target.files[0] is the file that was added.
        // URL.CreateObjectURL is user to allow local preview before upload.
        // The file attribute is what will actually be uploaded to the server.
        setPictures({...pictures, [id]: [...pictures[id], {file: event.target.files[0], uri: URL.createObjectURL(event.target.files[0])}]})
        setProducts(products.map(p => p.id === id ? ({...p, changed: true}) : p))
    }

    const handleRemovePicture = (uri, id) => () => {
        setPictures({...pictures, [id]: [...pictures[id].filter(i => i.uri !== uri)]});
        setProducts(products.map(p => p.id === id ? ({...p, images: p.images.filter(i => i !== uri), changed: true}) : p))
    }

    const handleDescriptionChange = (id) => (e) => {
        setProducts(products.map(p => p.id === id ? ({...p, longDescription: e.target.value, changed: true}) : p))
    }

    const handleTypesDescriptionChange = (type) => (e) => {
        setTypes(t => t.map(v => v.type === type ? ({...v, description: e.target.value, changed: true}) : v))
    }

    const handleKeyDown = (e) => e.keyCode === 13 ? handleSignIn() : null

    const handleCredentialsChange = (prop) => (e) => setCredentials(c => ({...c, [prop]: e.target.value}))

    const handleSignIn = () => {
        auth.signInWithEmailAndPassword(credentials.username, credentials.password)
            .catch((error) => console.log(error))
        setCredentials({username: '', password: ''})
    }

    const handleSignOut = () => auth.signOut()

    const handleSubmit = async () => {
        setWaiting(true)
        // Upload to Storage with SDK
        // Send url to the function
        console.log(Object.entries(pictures))
        const storageRef = storage.ref()
        const imagesRef = Object.entries(pictures).map(v => ({id: v[0], images: v[1].filter(i => i.uri.includes('blob:')).map(i => ({ref: storageRef.child('images/'+v[0]+'/'+i.file.name), file: i.file}))}))
        console.log(imagesRef)
        const storageResult = await Promise.all(imagesRef.map(v => v.images.map(i => i.ref.put(i.file))))
        const storageError = storageResult.filter(v => v.filter(i => i.error_ !== null).length > 0)
        if (storageError.length > 0) console.log("Noe gikk kanskje galt her...", storageError, storageResult)

        //const request = products.filter(p => p.changed).map(p => ({id: p.id, description: p.longDescription || '', images: [...p.images, ...imagesRef.find(i => i.id === p.id).images.map(v => 'https://firebasestorage.googleapis.com/v0/b/'+v.ref.location.bucket+'/o/'+encodeURI(v.ref.location.path).replaceAll('/', '%2F')+'?alt=media')]}))
        const request = {
            products: products.filter(p => p.changed).map(p => ({id: p.id, description: p.longDescription || '', images: [...p.images, ...imagesRef.find(i => i.id === p.id).images.map(v => 'https://static.gijernet.no/'+encodeURI(v.ref.location.path))]})),
            types: types.filter(p => p.changed).map(p => ({type: p.type, description: p.description || ''}))
            }

        console.log(request)
        functions.httpsCallable('addProductDetails')(request)
            .then(result => {
                console.log(result)
                setWaiting(false)
            })
            .catch(error => console.log(error))

    }

    useEffect(() => {
        fetch('/api/products?noCache=true')
            .then(v => v.json())
            .then(v => {
                // { [productId]: [{file: null, uri: "cloud.storage.whatever/file"}]}
                setProducts(v.products);
                setTypes(v.types)
                console.log(v.products)
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
        <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
            <FirebaseAuthConsumer>
                {({isSignedIn}) => {
                    if (isSignedIn) {
                        return (
                            <div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSignOut}
                                >
                                    Logg ut
                                </Button>
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
                                                                    src={i.uri.slice(0, i.uri.lastIndexOf('/')+1)+'thumb_'+i.uri.slice(i.uri.lastIndexOf('/')+1)}
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
                                                            startIcon={<Image/>}
                                                        >
                                                            Nytt bilde
                                                            <input
                                                                type="file"
                                                                style={{display: 'none'}}
                                                                onChange={handleAddPicture(v.id)}
                                                                accept="image/jpg image/png"
                                                                multiple
                                                            />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            variant="filled"
                                                            multiline
                                                            value={v.longDescription}
                                                            onChange={handleDescriptionChange(v.id)}
                                                            className={classes.description}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell align="center" colSpan={3}><Typography variant="h2">Typer</Typography></TableCell>
                                            </TableRow>
                                            {types.map(v => (
                                                <TableRow key={v.type}>
                                                    <TableCell>{v.type}</TableCell>
                                                    <TableCell colSpan={2}>
                                                        <TextField
                                                            variant="filled"
                                                            multiline
                                                            value={v.description}
                                                            onChange={handleTypesDescriptionChange(v.type)}
                                                            className={classes.description}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    startIcon={<Save/>}
                                    color="primary"
                                    disabled={waiting}
                                >
                                    Lagre
                                    {waiting && <CircularProgress size={24} className={classes.buttonProgress} />}
                                </Button>
                            </div>
                        )
                    } else {
                        return (
                            <Container>
                                <div>
                                    <TextField
                                        value={credentials.username}
                                        onChange={handleCredentialsChange('username')}
                                        label="Brukernavn"
                                        variant="filled"
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <div>
                                    <TextField
                                        value={credentials.password}
                                        onChange={handleCredentialsChange('password')}
                                        label="Passord"
                                        type="password"
                                        variant="filled"
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <Button
                                    variant="contained"
                                    onClick={handleSignIn}
                                >
                                    Logg inn
                                </Button>
                            </Container>
                        )
                    }

                }}
            </FirebaseAuthConsumer>

        </FirebaseAuthProvider>
    )
}

export default Admin;