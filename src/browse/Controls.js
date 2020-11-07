import React, {useState} from "react";
import {Container, TextField, FormGroup, FormLabel, FormControlLabel, Checkbox} from '@material-ui/core';

const Controls = (props) => {
    const [filters, setFilters] = useState(props.types.reduce((a, key) => Object.assign(a, {[key]: true}), {}))
    console.log(filters)
    const handleChange = (id) => () => {
        setFilters(filters => ({...filters, [id]: !filters[id]}))
    }
    return(
        <Container>
            <TextField variant='filled' label="Søk" />
            <FormLabel component="legend">Velg produkttyper</FormLabel>
            <FormGroup>
                {props.types.map(v => (
                    <FormControlLabel
                        key={v}
                        control={<Checkbox checked={filters[v]} onChange={handleChange(v)} name={v} />}
                        label={v}
                    />
                ))}
            </FormGroup>
        </Container>
    )
}

export default Controls;
