import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import indigo from '@material-ui/core/colors/indigo';
import * as serviceWorker from './serviceWorker';
import App from './containers/App';

const theme = createMuiTheme({
    palette: {
        primary: {
            text: grey[500],
            light: grey[700],
            main: indigo[50],
            dark: grey[900],
        },
    },
    typography: {
        useNextVariants: true,
        fontFamily: [
            "Source Han Sans",
            "源ノ角ゴシック",
            "Hiragino Sans",
            "HiraKakuProN-W3",
            "Hiragino Kaku Gothic ProN W3",
            "Hiragino Kaku Gothic ProN",
            "ヒラギノ角ゴ ProN W3",
            "Noto Sans",
            "Noto Sans CJK JP",
            "メイリオ",
            "游ゴシック",
            "ＭＳ Ｐゴシック",
            "MS PGothic",
            "ＭＳ ゴシック",
            "MS Gothic",
            'sans-serif',
        ].join(','),
    },
});

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>,
document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
