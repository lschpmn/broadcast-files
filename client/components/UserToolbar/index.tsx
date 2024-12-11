import { AppBar, Button, styled, Toolbar } from '@mui/material';
import React from 'react';
import PathHeader from './PathHeader';

const Index = () => {

  return (
    <AppBar position="relative">
      <MyToolbar>
        <PathHeader/>

        <Button
          onMouseDown={() => console.log('login')}
          variant="contained"
        >Login</Button>
      </MyToolbar>
    </AppBar>
  );
};

export default Index;

const MyToolbar = styled(Toolbar)`
  justify-content: space-between;
`;