import { AppBar, Button, Toolbar } from '@mui/material';
import React from 'react';

const UserToolbar = () => {

  return <div>
    <AppBar position="relative">
      <Toolbar style={{
        justifyContent: 'end',
        minHeight: '3rem',
      }}>
        <Button
          onMouseDown={() => console.log('login')}
          variant="contained"
        >Login</Button>
      </Toolbar>
    </AppBar>
  </div>;
};

export default UserToolbar;
