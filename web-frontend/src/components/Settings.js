import React from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../redux/actions';

const Settings = () => {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" mb={4}>
        Settings
      </Typography>
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={handleToggle} />}
        label="Dark Mode"
      />
    </Box>
  );
};

export default Settings;
