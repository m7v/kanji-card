import React from 'react';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import kanjiList from './kanjiList.json';
import KanjiCard from '../../components/KanjiCard';

export default function App() {
  console.log('kanjiList', kanjiList);

  const classes = useStyles();

  return (
    <Container>
      <Grid container className={classes.root} spacing={3}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={2}>
            {Object.values(kanjiList.items).map(value => (
              <Grid key={value.sign} item>
                <KanjiCard data={value} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
}));
