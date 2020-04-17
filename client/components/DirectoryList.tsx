import Button from '@material-ui/core/Button';
import T from '@material-ui/core/Typography';
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

  const files = list.filter(item => item.type === 'file');
  const directories = list.filter(item => item.type === 'dir');
  const showLabels = !!files.length && !!directories.length;

  return <div>
    <div style={{ display: 'flex' }}>
      <Link to="/">
        <Button>
          <h1>~</h1>
        </Button>
      </Link>

      {routes.map((route, i) =>
        <React.Fragment key={i}>
          <h1 style={{ padding: '6px 8px' }}>/</h1>
          <Link to={'/' + routes.slice(0, i + 1).join('/')}>
            <Button>
              <h1>{decodeURIComponent(route)}</h1>
            </Button>
          </Link>
        </React.Fragment>,
      )}
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {showLabels && (
        <T color='textSecondary' component='span' style={{ margin: '0.5rem 2rem', width: '100%' }}>
          Files <hr/>
        </T>
      )}
      {files.map(file => (
        <Button
          href={`${domain}/api/file${pathname}/${encodeURIComponent(file.name)}`}
          key={file.name}
          style={styles.button}
        >
          {file.name}
        </Button>
      ))}

      {showLabels && (
        <T color='textSecondary' component='span' style={{ margin: '0.5rem 2rem', width: '100%' }}>
          Directories <hr/>
        </T>
      )}
      {directories.map(directory => (
        <Link
          key={directory.name}
          to={`${pathname}/${encodeURIComponent(directory.name)}`}
        >
          <Button style={styles.button}>
            {directory.name}
          </Button>
        </Link>
      ))}
    </div>
  </div>;
};

const styles = {
  button: {
    height: '7.5rem',
    textAlign: 'center',
    width: '20rem',
    wordBreak: 'break-word',
  } as React.CSSProperties,
};

export default DirectoryList;
