import React from 'react';
import debounce from 'lodash/debounce';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FlipCard from '../FlipCard';

export default function KanjiCard(props) {
    const classes = useStyles();
    const [{ isFlipped }, setState] = React.useState({ isFlipped: false });

    const showBack = debounce(() => setState({ isFlipped: true }), 150);
    const showFront = debounce(() => setState({ isFlipped: false }), 150);

    return (
        <div className={classes.paper}>
            <FlipCard isFlipped={isFlipped}>
                <Paper className={clsx(classes.main, classes.card)} onClick={showBack}>
                    <Typography variant="h1">
                        {props.data.sign}
                    </Typography>
                </Paper>
                <Paper className={clsx(classes.other, classes.card)} onClick={showFront}>
                    <Typography variant="h2" gutterBottom>
                        {props.data.sign}
                    </Typography>
                    <div>
                        <Typography variant="subtitle2" gutterBottom>
                            {props.data.on}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                            {props.data.kun}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {props.data.meaning}
                        </Typography>
                    </div>
                </Paper>
            </FlipCard>
        </div>
    );
}

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(6, 0, 3),
    },
    paper: {
        cursor: 'pointer',
        height: 350,
        width: 250,
    },
    card: {
        borderRadius: 10,
        padding: theme.spacing(2),
        height: '100%',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    main: {

    },
    other: {
        color: theme.palette.text.secondary,
    }
}));
