import { styled } from '@mui/material';
import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import UserToolbar from './components/UserToolbar';

const App = () => {
  return (
    <Container>
      <UserToolbar/>

      <BrowserRouter>
        <Routes>
          {/*<Route path="/*" element={<DirectoryList />} />*/}
          {/*<Route path="/" element={<Landing />} />*/}
        </Routes>
      </BrowserRouter>
    </Container>
  );
};

const Container = styled('div')`
  background-color: ${props => props.theme.palette.background.default};
  height: 100%;
  overflow: auto;
`;

export default App;
