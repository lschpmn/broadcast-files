import { Button, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DirectoryRoute } from '../../types';
import { State } from '../types';

const Landing = () => {
  const routes = useSelector((state: State) => state.config.routes);

  return <div style={{ height: '100%' }}>
    {routes?.map((route: DirectoryRoute, i) => (
      <MyButtonLink
        component={Link}
        key={route.label}
        last={i === routes.length - 1 ? 'last' : ''}
        to={route.url}
        width={100 / routes.length}
      >
        {route.label}
      </MyButtonLink>
    ))}
  </div>;
};

export default Landing;

const MyButtonLink = styled(Button)<{ component, last, to, width }>`
  color: white;
  border-right: ${props => props.last ? '0px' : '1px'} solid grey;
  border-radius: 0;
  flex: 1;
  height: 100%;
  width: ${props => props.width}%;

  :hover {
    background-color: ${grey['800']};
  }
`;
