import Button from '@material-ui/core/Button';
import { InspectResult } from 'fs-jetpack/types';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CustomWindowProperties } from '../types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;

const DirectoryList = () => {
  const [list, setList] = useState([] as InspectResult[]);
  const { pathname } = useLocation();
  const routes = pathname.split('/').slice(1);

  useEffect(() => {
    fetch(`${domain}/api/dir${pathname}`, { credentials: 'include' })
      .then(async res => setList(await res.json()))
      .catch(console.log);
  }, [pathname]);

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
              <h1>{route}</h1>
            </Button>
          </Link>
        </React.Fragment>,
      )}
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {list.map(item =>
        item.type === 'dir'
          ? <Link
            key={item.name}
            to={`${pathname}/${encodeURIComponent(item.name)}`}
          >
            <Button style={styles.button}>
              {item.name}
            </Button>
          </Link>
          : <Button
            href={`${domain}/api/file${pathname}/${encodeURIComponent(item.name)}`}
            key={item.name}
            style={styles.button}
          >
            {item.name}
          </Button>
      )}
    </div>
  </div>;
};

const styles = {
  button: {
    height: '7.5rem',
    width: '20rem',
    wordBreak: 'break-word',
  } as React.CSSProperties,
};

export default DirectoryList;
