import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import kanjiList from './kanjiList.json';
import KanjiCard from '../../components/KanjiCard';

export default function App() {
  const classes = useStyles();

  return (
    <Grid container justify="center" className={classes.root}>
      {Object.values(kanjiList.items).map(value => (
        <Grid key={value.sign} item className={classes.item}>
          <KanjiCard data={value} />
        </Grid>
      ))}
    </Grid>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    padding: '16px 0',
    flexGrow: 1,
  },
  item: {
    margin: theme.spacing(3),
  },
}));
