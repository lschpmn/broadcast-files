import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import InputAdornment from '@material-ui/core/InputAdornment';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { jsonPostRequest } from '../lib/utils';
import { CustomWindowProperties } from '../types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;

const UserToolbar = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const classes = useStyles({});

  const close = useCallback(() => {
    setShowLogin(false);
    setShowPassword(false);
    setUsername('');
    setPassword('');
  }, []);

  const login = useCallback(() => {
    jsonPostRequest({ username, password })
      .then(async res => {
        const response = await res.text();
        console.log('response');
        console.log(response);
      })
      .catch(err => {
        console.log(err.message);
        console.log(err);
      });
  }, [username, password]);

  const toggleShowPassword = useCallback(() =>
    setShowPassword(!showPassword), [showPassword]);

  return <div>
    <AppBar position='relative' >
      <Toolbar className={classes.toolbar}>
        <Button onMouseDown={() => setShowLogin(true)}>Login</Button>
      </Toolbar>
    </AppBar>

    <Dialog
      open={showLogin}
      onClose={close}
      classes={{ paper: classes.dialog }}
    >
      <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
        <div>Username</div>
        <div>
          <TextField
            onChange={event => setUsername(event.target.value)}
            style={{ width: '100%' }}
            value={username}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
          <div style={{ marginRight: '0.5rem' }}>Password</div>
        </div>

        <div>
          <TextField
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  {showPassword
                    ? <VisibilityIcon className={classes.visibilityIcon} onMouseDown={toggleShowPassword}/>
                    : <VisibilityOff className={classes.visibilityIcon} onMouseDown={toggleShowPassword}/>
                  }
                </InputAdornment>
              )
            }}
            onChange={event => setPassword(event.target.value)}
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
        </div>

        <Button onClick={login} variant="outlined" style={{ marginTop: '1.5rem' }}>Login</Button>
      </DialogContent>
    </Dialog>
  </div>;
};

const useStyles = makeStyles({
  dialog: {
    padding: '2rem',
  },
  toolbar: {
    backgroundColor: '#121212',
    justifyContent: 'end',
    minHeight: '3rem',
  },
  visibilityIcon: {
    cursor: 'pointer'
  },
});

export default UserToolbar;
