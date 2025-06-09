import React, {useEffect, useState} from "react";
import {Container, TextField, FormGroup, FormLabel, FormControlLabel, Checkbox, Button} from '@material-ui/core';

const Controls = (props) => {
    const [search, setSearch] = useState(props.search)
    const handleSearch = (e) => {
        setSearch(e.target.value)
    }
    useEffect(() => {
        const timeOutId = setTimeout(() => props.handleSearch(search), 50);
        return () => clearTimeout(timeOutId);
    }, [props, search])
    return(
        <Container>
            <TextField id="search" variant='filled' label="Søk" value={search} onChange={handleSearch} />
            <br/><br/>
            <FormLabel component="legend">Velg produkttyper</FormLabel>
            <Button
                color="primary"
                onClick={props.handleResetControls}
            >
                Tilbakestill
            </Button>
            <Button
                color="primary"
                onClick={props.handleSelectAll}
            >
                Velg Alle
            </Button>
            <FormGroup>
                {props.types.map(v => (
                    <FormControlLabel
                        key={v}
                        control={<Checkbox color={"primary"} checked={props.filters[v]} onChange={props.handleChange(v)} name={v} />}
                        label={v}
                    />
                ))}
            </FormGroup>
        </Container>
    )
}

export default Controls;
