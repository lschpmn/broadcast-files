import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LoopIcon from '@material-ui/icons/Loop';
import { InspectResult } from 'fs-jetpack/types';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Message } from '../../types';

const RESIZE_FACTOR = 0.3;
const domain = window.__DOMAIN__;

type Props = {
  file: InspectResult,
  thumbnail?: Message,
};

const FileNode = ({ file, thumbnail }: Props) => {
  const { pathname } = useLocation();
  const classes = useStyles({});

  return <Button
    className={classes.button}
    href={`${domain}/api/file${pathname}/${encodeURIComponent(file.name)}`}
    target="_blank"
  >
    {thumbnail?.status === 'loading' && <LoopIcon/>}
    {!!thumbnail?.image && <img src={thumbnail?.image}/>}
    {(!thumbnail?.status || thumbnail?.status === 'error') && <InsertDriveFileIcon/>}
    <div style={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: 854 * RESIZE_FACTOR,
    }}>{file.name}</div>
  </Button>;
};

const useStyles = makeStyles({
  button: {
    // height: 480 * RESIZE_FACTOR,
    margin: '0',
    padding: '1rem',
    textAlign: 'center',
    // width: 854 * RESIZE_FACTOR,
    wordBreak: 'break-word',

    '& img': {
      height: 480 * RESIZE_FACTOR,
      width: 854 * RESIZE_FACTOR,
    },

    '& > span': {
      display: 'flex',
      flexDirection: 'column',
    },

    '& > span > svg': {
      fontSize: '4.5rem',
    },
  },
});

export default FileNode;
