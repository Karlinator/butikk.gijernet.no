import React from "react";
import {
    Container,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TableCell,
    TableBody
} from "@material-ui/core";

const Privacy = () => {
    return (
        <Container>
            <Typography variant="h3">
                Cookies og personvernerklæring
            </Typography>
            <Typography variant="h4">Cookies/Informasjonskapsler</Typography>
            <Typography variant="body1">
                Vi bruker ikke veldig mange cookies, men noen trenger vi. Der er noen som er nødvendige for at ting skal fungere, og noen vi bruker for analyse, men bare hvis du sier ja.
            </Typography>
            <Typography variant="body1">
                Alle informasjonskapslene er tredjeparts, det vil si at det er informasjonskapsler som andre tjenester setter, og som vi ikke har direkte kontroll over. Tilbyderne, formålet med dem, og en lenke til deres cookie-policy er listet opp under.
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Tjeneste
                            </TableCell>
                            <TableCell>
                                Formål
                            </TableCell>
                            <TableCell>
                                Cookie-policy
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Stripe
                            </TableCell>
                            <TableCell>
                                Betalingstjeneste. Vi bruker Stripe for å håndtere kortbetalinger. De bruker cookies for flere formål, blant dem sikkerhet, motarbeiding av kortsvindel, analyse, og markedsføring.
                            </TableCell>
                            <TableCell>
                                <a href="https://stripe.com/cookies-policy/legal">Stripe Cookie Policy</a>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="h4">
                Personvern
            </Typography>
            <Typography variant="body1">
                Vi samler så lite informasjon om deg som mulig, men noe må vi ha. For å kunne sende varene til deg trenger vi navn og addresse, og for å få kvitteringen må vi ha en epostaddresse å sende den til. For at du skal betale må du oppgi kortinformasjon. Denne informasjonen brukes bare til å gjennomføre selve handelen
            </Typography>
            <Typography variant="body1">
                For å gjennomføre handelen bruker vi Stripe. All informasjonen nevnt over samles inn gjennom Stripe Checkout, og deles med de. Du kan finne personvernerklæringen til stripe <a href="https://stripe.com/en-gb-no/privacy">her.</a>
            </Typography>
        </Container>
    )
}

export default Privacy