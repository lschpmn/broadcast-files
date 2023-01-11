import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import App from './App';
import loggerMiddleware from './lib/middleware';
import reducers from './lib/reducers';

const store = createStore(reducers, applyMiddleware(loggerMiddleware));
const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

render((
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App/>
    </ThemeProvider>
  </Provider>
), document.getElementById('react'));
