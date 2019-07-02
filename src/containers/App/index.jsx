import React from 'react';
import firebase from '../../libs/firebase'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Stack } from '../../components/Stack';

export default function App() {
  const classes = useStyles();
  const [{ cards }, setState] = React.useState({ cards: [] });

  React.useEffect(() => {
    firebase.getKanjiCards().then((cards) => setState({ cards }));
  }, []);

  return (
    <Grid container justify="center" className={classes.root}>
      <Stack cards={cards} />
    </Grid>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
  },
}));
