import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { DirectoryRoute } from '../types';

// @ts-ignore
const port = window.__PORT__;

const App = () => {
  const [routes, setRoutes] = useState([]);
  const classes = useStyles({});

  useEffect(() => {
    fetch(`http://localhost:${port}/config`)
      .then(async res => setRoutes(await res.json()))
      .catch(console.log);
  }, []);

  return <div className={classes.container}>
    {routes.map((route: DirectoryRoute) =>
      <Button key={route.label} className={classes.button} style={{ width: 100 / routes.length + '%' }}>
        {route.label}
      </Button>
    )}
  </div>;
};

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    height: '100%',
  },
  button: {
    height: '100%',
  },
}));

export default hot(App);
