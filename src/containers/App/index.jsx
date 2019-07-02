import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Stack } from '../../components/Stack';

export default function App() {
  const classes = useStyles();

  return (
    <Grid container justify="center" className={classes.root}>
      <Stack />
    </Grid>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
  },
}));
