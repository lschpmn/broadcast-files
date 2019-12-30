import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { DirectoryRoute } from '../types';
import DirectoryList from './components/DirectoryList';
import { CustomWindowProperties } from './types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;

const App = () => {
  const [route, setRoute] = useState(null as null | DirectoryRoute);
  const [routes, setRoutes] = useState([]);
  const classes = useStyles({});

  const back = useCallback(() => setRoute(null), []);

  useEffect(() => {
    fetch(`${domain}/config`)
      .then(async res => setRoutes(await res.json()))
      .catch(console.log);
  }, []);

  return <div className={classes.container}>
    {!route && routes.map((route: DirectoryRoute) =>
      <Button
        className={classes.button}
        key={route.label}
        onClick={() => setRoute(route)}
        style={{ width: 100 / routes.length + '%' }}
      >
        {route.label}
      </Button>
    )}
    {route &&
      <DirectoryList back={back} route={route} />
    }
  </div>;
};

const useStyles = makeStyles(theme => ({
  button: {
    height: '100%',
  },
  container: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    height: '100%',
    overflow: 'auto',
  },
}));

export default hot(App);
