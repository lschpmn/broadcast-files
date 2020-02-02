import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DirectoryRoute } from '../../types';
import { get, JwtContext } from '../lib/utils';

const Landing = () => {
  const [routes, setRoutes] = useState([]);
  const classes = useStyles({});
  const jwt = useContext(JwtContext);

  useEffect(() => {
    get('/config')
      .then(async res => setRoutes(await res.json()))
      .catch(console.log);
  }, [jwt]);

  return <>
    {routes.map((route: DirectoryRoute) =>
      <Link key={route.label} to={route.urlPath}>
        <Button
          className={classes.button}
          style={{ width: (100 / routes.length) + '%' }}
        >
          {route.label}
        </Button>
      </Link>
    )}
  </>
};

const useStyles = makeStyles(theme => ({
  button: {
    height: '100%',
  },
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
}));

export default Landing;
