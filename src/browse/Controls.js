import React, {useState} from "react";
import {Container, TextField, FormGroup, FormLabel, FormControlLabel, Checkbox} from '@material-ui/core';

const Controls = (props) => {
    const [filters, setFilters] = useState(props.types.reduce((a, key) => Object.assign(a, {[key]: true}), {}))
    const [search, setSearch] = useState('')

    const handleSearch = (e) => {
        setSearch(e.target.value)
        props.onChange(e.target.value, filters)
    }

    const handleChange = (id) => () => {
        setFilters(filters => {
            const filtersNew = {...filters, [id]: !filters[id]}
            props.onChange(search, filtersNew)
            return filtersNew
        })

    }
    return(
        <Container>
            <TextField variant='filled' label="Søk" value={search} onChange={handleSearch} />
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
