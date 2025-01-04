import { styled } from '@mui/material';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingView from './components/LandingView';
import SwitchView from './components/SwitchView';
import UserToolbar from './components/UserToolbar';

const App = () => {

  return (
    <Container>
      <BrowserRouter>
        <UserToolbar/>

        <Routes>
          <Route path="/*" element={<SwitchView />}/>
          <Route path="/" element={<LandingView/>}/>
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
