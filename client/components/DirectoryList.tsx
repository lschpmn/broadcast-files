import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import T from '@material-ui/core/Typography';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { InspectResult } from 'fs-jetpack/types';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { get } from '../lib/utils';

const domain = window.__DOMAIN__;

const DirectoryList = () => {
  const [list, setList] = useState([] as InspectResult[]);
  const { pathname } = useLocation();
  const routes = pathname.split('/').slice(1);

  useEffect(() => {
    get(`/dir${pathname}`)
      .then(res => setList(res))
      .catch(console.log);
  }, [pathname]);

  const [files, directories, showLabels] = useFilesAndDirectories(list);

  const classes = useStyles({});

  return <div>
    <div style={{ display: 'flex' }}>
      <Link to="/">
        <Button>
          <h2>~</h2>
        </Button>
      </Link>

      {routes.map((route, i) =>
        <React.Fragment key={i}>
          <h2 style={{ padding: '6px 8px' }}>/</h2>
          <Link to={'/' + routes.slice(0, i + 1).join('/')}>
            <Button>
              <h2>{decodeURIComponent(route)}</h2>
            </Button>
          </Link>
        </React.Fragment>
      )}
    </div>

    <div style={{ display: 'flex', marginLeft: '2rem', flexWrap: 'wrap' }}>
      {showLabels && (
        <T color='textSecondary' component='span' style={{ margin: '0.5rem 0', width: '100%' }}>
          Directories <hr/>
        </T>
      )}
      {directories.map(directory => (
        <Link
          key={directory.name}
          to={`${pathname}/${encodeURIComponent(directory.name)}`}
        >
          <Button className={classes.dirButton}>
            {directory.name}
          </Button>
        </Link>
      ))}

      {showLabels && (
        <T color='textSecondary' component='span' style={{ margin: '0.5rem 0', width: '100%' }}>
          Files <hr/>
        </T>
      )}
      {files.map(file => (
        <Button
          className={classes.button}
          href={`${domain}/api/file${pathname}/${encodeURIComponent(file.name)}`}
          key={file.name}
        >
          <InsertDriveFileIcon/>
          {file.name}
        </Button>
      ))}
    </div>
  </div>;
};

const useFilesAndDirectories = (list: InspectResult[]): [InspectResult[], InspectResult[], boolean] => {
  const [files, setFiles] = useState([] as InspectResult[]);
  const [directories, setDirectories] = useState([] as InspectResult[]);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    const tmpFiles = list.filter(item => item.type === 'file');
    const tmpDirectories = list.filter(item => item.type === 'dir');

    setFiles(tmpFiles);
    setDirectories(tmpDirectories);
    setShowLabels(!!tmpFiles.length && !!tmpDirectories.length);
  }, [list]);

  return [files, directories, showLabels];
};

const useStyles = makeStyles({
  button: {
    height: '7.5rem',
    textAlign: 'center',
    width: '20rem',
    wordBreak: 'break-word',

    '& > span': {
      display: 'flex',
      flexDirection: 'column',
    },

    '& > span > svg': {
      fontSize: '4.5rem',
    },
  },
  dirButton: {
    height: '7.5rem',
    textAlign: 'center',
    width: '20rem',
    wordBreak: 'break-word',
  },
});

export default DirectoryList;
