import { Button, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Route } from '../../types';
import { getConfigSendServer } from '../lib/reducers';
import { State } from '../types';

const Landing = () => {
  const dispatch = useDispatch();
  const routes = useSelector((state: State) => state.config.routes);

  useEffect(() => {
    dispatch(getConfigSendServer());
  }, []);

  return <div style={{ height: '100%' }}>
    {routes?.map((route: Route, i) => (
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
