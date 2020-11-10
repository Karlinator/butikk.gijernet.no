import React from "react";
import {Container, TextField, FormGroup, FormLabel, FormControlLabel, Checkbox} from '@material-ui/core';

const Controls = (props) => {
    return(
        <Container>
            <TextField variant='filled' label="Søk" value={props.search} onChange={props.handleSearch} />
            <FormLabel component="legend">Velg produkttyper</FormLabel>
            <FormGroup>
                {props.types.map(v => (
                    <FormControlLabel
                        key={v}
                        control={<Checkbox checked={props.filters[v]} onChange={props.handleChange(v)} name={v} />}
                        label={v}
                    />
                ))}
            </FormGroup>
        </Container>
    )
}

export default Controls;
