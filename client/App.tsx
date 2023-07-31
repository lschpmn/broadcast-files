import { styled } from '@mui/material';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing';
import NewDirectory from './components/DirectoryWindow';
import UserToolbar from './components/UserToolbar';

const App = () => {
  return (
    <Container>
      <BrowserRouter>
        <UserToolbar/>

        <Routes>
          <Route path="/*" element={<NewDirectory />} />
          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
};

const Container = styled('div')`
  background-color: ${props => props.theme.palette.background.default};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export default App;
