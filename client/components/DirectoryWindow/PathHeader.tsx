import HomeIcon from '@mui/icons-material/Home';
import { Button } from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PathHeader = () => {
  const { pathname } = useLocation();
  const routes = pathname.split('/').slice(1);

  return <div style={{ display: 'flex' }}>
    <Link to="/" style={{ display: 'flex' }}>
      <Button style={{ color: 'white' }}>
        <HomeIcon/>
      </Button>
    </Link>

    {routes.map((route, i) =>
      <React.Fragment key={i}>
        <h2 style={{ color: 'white', padding: '6px 8px' }}>/</h2>
        <Link to={'/' + routes.slice(0, i + 1).join('/')}>
          <Button style={{ color: 'white' }}>
            <h2>{decodeURIComponent(route)}</h2>
          </Button>
        </Link>
      </React.Fragment>,
    )}
  </div>;
};

export default PathHeader;
