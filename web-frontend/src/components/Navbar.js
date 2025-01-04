import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  const location = useLocation();

  // Check if the current path is either "/login" or "/signup"
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/logout';

  return (
    <AppBar position="static" style={{ background: '#3f51b5' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            Content Curation Platform
          </Link>
        </Typography>

        <Box>
          {!isAuthPage && (
            <>
              <Button color="inherit" component={Link} to="/feed">
                Feed
              </Button>
              <Button color="inherit" component={Link} to="/settings">
                Settings
              </Button>
              <Button color="inherit" component={Link} to="/logout">
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
