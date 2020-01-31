import makeStyles from '@material-ui/core/styles/makeStyles';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Route } from 'react-router-dom';
import DirectoryList from './components/DirectoryList';
import Landing from './components/Landing';
import UserToolbar from './components/UserToolbar';
import { CustomWindowProperties } from './types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;

const App = () => {
  const [routes, setRoutes] = useState([]);
  const classes = useStyles({});

  useEffect(() => {
    fetch(`${domain}/config`)
      .then(async res => setRoutes(await res.json()))
      .catch(console.log);
  }, []);

  return <div className={classes.container}>
    <UserToolbar />

    <BrowserRouter>
      <Route path="/*" render={props => props.location.pathname !== '/' &&  <DirectoryList />} />
      <Route path="/" exact render={() => <Landing routes={routes} />} />
    </BrowserRouter>
  </div>;
};

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    height: '100%',
    overflow: 'auto',
  },
}));

export default hot(App);
