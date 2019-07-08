import React from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import KanjiCard from '../../components/KanjiCard';
import firebase from '../../libs/firebase'
import { Typography } from '@material-ui/core';

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 50 });
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1000px) rotateX(5deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const gone = new Set();
const repeat = new Set();

export function Stack() {
    const classes = useStyles();
    const [{ circle }, setState] = React.useState({ circle: 1 });
    const [ cards, setCards ] = React.useState([]);
    const [ message, setMessage ] = React.useState(undefined);
    const [ props, set ] = useSprings(cards.length, i => ({ ...to(i), from: from(i) })); // Create a bunch of springs using the helpers above

    React.useEffect(() => {
        firebase.getKanjiCards().then(({ cards, message }) => {
            setCards(cards);
            setMessage(message);
        });
    }, []);

    // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
    const bind = useGesture(({ args: [index], down, delta: [xDelta], direction: [xDir], velocity }) => {
        const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
        const dir = xDir < 0 ? -1 : 1; // Direction should either point () => console.log => console.log('rigth')left') or right

        if (!down && trigger) {
            if (dir === 1) {
                console.log('I know this card');
                gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
                firebase.upCardStatus(cards[index]);
            }
            if (dir === -1) {
                console.log('Need to repeat');
                repeat.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
                firebase.lowCardStatus(cards[index]);
            }
        }

        set((i) => {
            if (index !== i) {
                return;
            } // We're only interested in changing spring-data for the current spring

            const isGone = gone.has(index) || repeat.has(index);
            const x = isGone ? (100 + window.innerWidth) * dir : down ? xDelta : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
            const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
            const scale = down ? 1.1 : 1; // Active cards lift up a bit

            return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
        })
    });

    const repeatCb = () => {
        console.log('Next round!');
        setTimeout(() => {
            setState({ circle: circle + 1 });
            let list = [];
            repeat.forEach((i) => list.push(i));
            gone.clear();
            repeat.clear();
            set((i) => list.indexOf(i) !== -1 ? to(i) : from(i));
        }, 600);
    };

    // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
    return (
        <>
            <div className={classes.wrapper}>
                {!!message &&
                    <Typography color='secondary' variant="h2" gutterBottom>
                        休みましょう
                    </Typography>
                }
                {!!cards.length &&
                    <div className={classes.container}>
                        <Button color='secondary' onClick={repeatCb}>再びますか</Button>
                    </div>
                }
                {props.map(({ x, y, rot, scale }, i) => (
                    <animated.div className={classes.container} key={cards[i].id} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0) rotate(${x / 25}deg)`) }}>
                        {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
                        <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans) }}>
                            <KanjiCard key={cards[i].id + circle} data={cards[i]} />
                        </animated.div>
                    </animated.div>
                ))}
            </div>
            {!!cards.length &&
                <div className={classes.actions}>
                    <ButtonGroup fullWidth color="secondary" aria-label="Outlined primary button group">
                        <Button onClick={() => console.log('left')}>いいえ</Button>
                        <Button onClick={() => console.log('right')}>はい</Button>
                    </ButtonGroup>
                </div>
            }
        </>
    )
};

const useStyles = makeStyles((theme) => ({
    wrapper: {
        backgroundColor: theme.palette.primary.main,
        position: 'fixed',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    container: {
        userSelect: 'none',
        backgroundColor: 'transparent',
        position: 'absolute',
        willChange: 'transform',
    },
    actions: {
        position: 'absolute',
        width: 300,
        bottom: 30,
    },
}));
