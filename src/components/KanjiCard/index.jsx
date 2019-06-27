import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(6, 0, 3),
    },
    paper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: theme.spacing(2),
        textAlign: 'center',
        height: 270,
        width: 400,
    },
    other: {
        color: theme.palette.text.secondary,
    }
}));

export default function KanjiCard(props) {
    const classes = useStyles();

    return (
        <Paper className={classes.paper}>
            <Typography variant="h2" gutterBottom>
                {props.data.sign}
            </Typography>
            <div className={classes.other}>
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
    );
}