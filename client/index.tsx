import { createTheme, ThemeProvider } from '@mui/material';
import { deepPurple, green } from '@mui/material/colors';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { loggingMiddleware, socketMiddleware } from './lib/middleware';
import { configReducer, nodeShrubReducer } from './lib/reducers';

const store = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat([ loggingMiddleware, socketMiddleware ]),
  reducer: {
    config: configReducer,
    nodeShrub: nodeShrubReducer,
  },
});

// idea for app primary color: purple
// base it off HboMax's old look before their change to blue
const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple['500'],
    },
    secondary: {
      main: green['500'],
    },
    mode: 'dark',
  },
});

const root = createRoot(document.getElementById('react'));
root.render((
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App/>
    </ThemeProvider>
  </Provider>
));
