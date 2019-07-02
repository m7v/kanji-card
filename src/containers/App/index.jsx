import React from 'react';
import orderBy from 'lodash/orderBy';
import shuffle from 'lodash/shuffle';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import kanjiList from './kanjiList.json';
import { Stack } from '../../components/Stack';
// import { Swipe } from '../../components/Swipe';

const cards = orderBy(
    Object.values(kanjiList.items).filter((item) => item.tags[0] === 'n5'),
    (o) => o.tags[0].match(/\d/g)[0],
    'desc'
);

export default function App() {
  const classes = useStyles();

  return (
    <Grid container justify="center" className={classes.root}>
      <Stack cards={shuffle(cards.splice(0, 20))} />
      {/* <Swipe cards={cards.splice(0, 20)} /> */}
    </Grid>
  )
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    height: '100%',
  },
}));
