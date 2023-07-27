import HomeIcon from '@mui/icons-material/Home';
import { Button, styled } from '@mui/material';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PathHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routes = pathname.split('/').slice(1);

  return <div style={{ display: 'flex' }}>
    <Link to="/" style={{ display: 'flex' }}>
      <Button style={{ color: 'white' }}>
        <HomeIcon/>
      </Button>
    </Link>

    {routes.map((route, i) =>
      <ItemContainer key={i}>
        <h2>/</h2>.
        <Button onClick={() => navigate('/' + routes.slice(0, i + 1).join('/'))}>
          <h2>{decodeURIComponent(route)}</h2>
        </Button>
      </ItemContainer>,
    )}
  </div>;
};

const ItemContainer = styled('div')`
  display: flex;
  align-items: center;

  h2 {
    color: white;
  }

  a > button {
    color: white;
  }
`;

export default PathHeader;
