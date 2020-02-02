import makeStyles from '@material-ui/core/styles/makeStyles';
import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Route } from 'react-router-dom';
import DirectoryList from './components/DirectoryList';
import Landing from './components/Landing';
import UserToolbar from './components/UserToolbar';
import { JwtContext, useJwt } from './lib/utils';

const App = () => {
  const classes = useStyles({});
  const jwt = useJwt();

  return <JwtContext.Provider value={jwt}>
    <div className={classes.container}>
      <UserToolbar />

      <BrowserRouter>
        <Route path="/*" render={props => props.location.pathname !== '/' &&  <DirectoryList />} />
        <Route path="/" exact render={() => <Landing />} />
      </BrowserRouter>
    </div>
  </JwtContext.Provider>;
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
