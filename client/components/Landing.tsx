import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { Link } from 'react-router-dom';
import { DirectoryRoute } from '../../types';

type Props = {
  routes: DirectoryRoute[],
};

const Landing = ({ routes }: Props) => {
  const classes = useStyles({});

  return <>
    {routes.map((route: DirectoryRoute) =>
      <Link key={route.label} to={'/all' + route.urlPath}>
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
