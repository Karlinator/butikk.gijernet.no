import {AppBar, Container, IconButton, Toolbar, Typography} from "@material-ui/core";
import React from "react";
import {Link} from "react-router-dom";
import {ArrowBack} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    content: {
        marginTop: 50
    }
}))

const Success = () => {
    const classes = useStyles()
    return (
        <div>
            <AppBar aria-label="navigasjon" position="sticky">
                <Toolbar>
                    <IconButton component={Link} to="/" color="inherit" edge="start" aria-label="tilbake">
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Gi Jernet Nettbutikk
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container className={classes.content} align="center">
                <Typography variant="h4">Takk for handelen!</Typography>
                <Typography variant="body1">
                    Pengene går rett tilbake til Nepal/Himalaya og arbeidet der. <a href="https://gijernet.no/om-butikken">Les mer.</a>
                </Typography>
            </Container>
        </div>
    )
}

export default Success