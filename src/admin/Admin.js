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
    const [indexes, setIndexes] = useState()

    // NOTE: All 4 handlers intentionally do not cause a re-render.
    // This is done to save rendering time, and prevent all components from re-rendering
    // Instead, the displayed values in each component is stored and updated locally, and then collected here by these.
    const handleAddPicture = (id, files) => {
        // event.target.files[0] is the file that was added.
        // URL.CreateObjectURL is user to allow local preview before upload.
        // The file attribute is what will actually be uploaded to the server.
        setPictures(p => {
            p[id] = [...p[id], {file: files[0], uri: URL.createObjectURL(files[0])}]
            return p
        })
        setProducts(p => {
            p[indexes.products[id]] = {...p[indexes.products[id]], changed: true}
            return p
        })
    }

    const handleRemovePicture = (uri, id) => {
        setPictures(p => {
            p[id] = p[id].filter(i => i.uri !== uri)
            return p
        });
        setProducts(p => {
            //console.log('removing from', p, 'at position', indexes.products[id], 'indexes: ', indexes)
            p[indexes.products[id]] = {...p[indexes.products[id]], images: p[indexes.products[id]].images.filter(i => i !== uri), changed: true}
            //console.log(p[indexes.products[id]])
            return p
        })
    }

    const handleDescriptionChange = (id, value) => {
        //setProducts(products.map(p => p.id === id ? ({...p, longDescription: value, changed: true}) : p))
        setProducts(t => {
            console.log(t)
            console.log(indexes)
            t[indexes.products[id]] = {...t[indexes.products[id]], longDescription: value, changed: true}
            console.log([...t])
            return t
        })
    }

    const handleTypesDescriptionChange = (type) => (e) => {
        //setTypes(t => t.map(v => v.type === type ? ({...v, description: e.target.value, changed: true}) : v))
        setTypes(t => {
            //console.log(t)
            //console.log(indexes)
            t[indexes.types[type]] = {...t[indexes.types[type]], description: e.target.value, changed: true}
            //console.log([...t])
            return t
        })
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
                console.log(v.types)
                const i = {types: v.types.reduce((a, key, i) => ({...a, [key.type]: i}), {}), products: v.products.reduce((a, key, i) => ({...a, [key.id]: i}), {})}
                setIndexes(i)
                console.log(i)
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
                                            {products.map(v =>
                                                <ProductRow
                                                    v={v}
                                                    key={v.id}
                                                    onChange={handleDescriptionChange}
                                                    onAddPicture={handleAddPicture}
                                                    onRemovePicture={handleRemovePicture}
                                                    pictures={pictures[v.id]}
                                                />)}
                                            <TableRow key="separator">
                                                <TableCell align="center" colSpan={3}><Typography variant="h2">Typer</Typography></TableCell>
                                            </TableRow>
                                            {types.map(v =>
                                                <TypeRow key={v.id} v={v} onChange={handleTypesDescriptionChange}/>)}
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

const ProductRow = ({v, onRemovePicture, onAddPicture, onChange, pictures}) => {
    console.log(pictures)
    const classes = useStyles()
    const [description, setDescription] = useState(v.longDescription)
    const [pics, setPics] = useState(pictures)
    const handleChange = (id) => (e) => {
        onChange(id, e.target.value)
        setDescription(e.target.value)
    }
    const handleAddPicture = (id) => (e) => {
        onAddPicture(id, e.target.files)
        setPics(p => [...p, {file: e.target.files[0], uri: URL.createObjectURL(e.target.files[0])}])
    }
    const handleRemovePicture = (uri, id) => () => {
        onRemovePicture(uri, id)
        setPics(p => [...p.filter(i => i.uri !== uri)])
    }
    return (
        <TableRow>
            <TableCell>{v.title}</TableCell>
            <TableCell>
                {pics.map(i => (
                    <div key={i.uri}>
                        <img
                            alt=""
                            className={classes.imgList}
                            src={!i.uri.includes('blob:') ? i.uri.slice(0, i.uri.lastIndexOf('/')+1)+'thumb_'+i.uri.slice(i.uri.lastIndexOf('/')+1): i.uri}
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
                    value={description}
                    onChange={handleChange(v.id)}
                    className={classes.description}
                />
            </TableCell>
        </TableRow>
    )
}

const TypeRow = ({v, onChange}) => {
    const classes = useStyles()
    return (
        <TableRow>
            <TableCell>{v.type}</TableCell>
            <TableCell colSpan={2}>
                <TextField
                    variant="filled"
                    multiline
                    value={v.description}
                    onChange={onChange(v.type)}
                    className={classes.description}
                />
            </TableCell>
        </TableRow>
    )
}

export default Admin;