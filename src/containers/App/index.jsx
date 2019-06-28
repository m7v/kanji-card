import React from 'react';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import kanjiList from './kanjiList.json';
import KanjiCard from '../../components/KanjiCard';

export default function App() {
  const classes = useStyles();

  return (
    <Container className={classes.padding}>
      <Grid container className={classes.root} spacing={8}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={4}>
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
  padding: {
    padding: '16px 0',
  },
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
}));
