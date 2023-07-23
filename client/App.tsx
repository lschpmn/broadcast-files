import { useTheme } from '@mui/material';
import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';

const App = () => {
  const theme = useTheme();

  return (
    <div style={{
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      height: '100%',
      overflow: 'auto',
    }}>
      {/*<UserToolbar/>*/}

      <BrowserRouter>
        <Routes>
          {/*<Route path="/*" element={<DirectoryList />} />*/}
          {/*<Route path="/" element={<Landing />} />*/}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
