import React from 'react';
import { Box, TextField, Button } from '@mui/material';

const Search = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <TextField label="Search Content" variant="outlined" fullWidth />
      <Button variant="contained" sx={{ mt: 2 }}>
        Search
      </Button>
    </Box>
  );
};

export default Search;
