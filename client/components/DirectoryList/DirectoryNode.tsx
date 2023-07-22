import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { InspectResult } from 'fs-jetpack/types';
import React from 'react';
import { useNavigate , useLocation } from 'react-router-dom';

const RESIZE_FACTOR = 0.3;

type Props = {
  directory: InspectResult
};

const DirectoryNode = ({ directory }: Props) => {
  const navigate = useNavigate ();
  const { pathname } = useLocation();
  const classes = useStyles({});

  return <Button
    className={classes.dirButton}
    onClick={() => navigate(`${pathname}/${encodeURIComponent(directory.name)}`)}
  >
    <span>{directory.name}</span>
  </Button>;
};

const useStyles = makeStyles({
  dirButton: {
    padding: '1rem',
    textAlign: 'center',
    wordBreak: 'break-word',

    '& > span': {
      height: 480 * RESIZE_FACTOR,
      width: 854 * RESIZE_FACTOR,
    },
  },
});

export default DirectoryNode;
