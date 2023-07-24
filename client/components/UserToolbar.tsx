import { AppBar, Button, styled, Toolbar } from '@mui/material';
import React from 'react';

const UserToolbar = () => {

  return (
    <AppBar position="relative">
      <MyToolbar>
        <Button
          onMouseDown={() => console.log('login')}
          variant="contained"
        >Login</Button>
      </MyToolbar>
    </AppBar>
  );
};

export default UserToolbar;

const MyToolbar = styled(Toolbar)`
  justify-content: end;
`;