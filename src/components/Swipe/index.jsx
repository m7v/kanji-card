import React from 'react';
import Swipeable from '../Swipeable/';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import KanjiCard from '../KanjiCard';

export class Swipe extends React.PureComponent {
    state = {
        cards: this.props.cards,
    };

    remove = () =>
        this.setState(({ cards }) => ({ cards: cards.slice(1, cards.length) }));

    render() {
        const { cards } = this.state;

        return (
            <div style={appStyles}>
                <div style={wrapperStyles}>
                    {cards.length > 0 && (
                        <>
                            {cards.length > 1 && <Card key={cards[1].sign}><KanjiCard data={cards[1]} /></Card>}
                            <div style={wrapperStyles}>
                                <Swipeable
                                    buttons={({ right, left }) => (
                                        <div style={actionsStyles}>
                                            <ButtonGroup fullWidth color="secondary" aria-label="Outlined primary button group">
                                                <Button onClick={left}>いいえ</Button>
                                                <Button onClick={right}>はい</Button>
                                            </ButtonGroup>
                                        </div>
                                    )}
                                    onAfterSwipe={this.remove}>
                                    <Card key={cards[0].sign}><KanjiCard data={cards[0]} /></Card>
                                </Swipeable>
                            </div>
                        </>
                    )}
                    {cards.length <= 1 && <Card zIndex={-2}>No more cards</Card>}
                </div>
            </div>
        );
    }
}

const wrapperStyles = { position: 'relative', width: '250px', height: '350px' };
const actionsStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12
};

const appStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    overflow: 'hidden'
};

const cardStyles = {
    borderRadius: 3,
    height: '100%',
    width: '100%',
    cursor: "pointer",
    userSelect: "none",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: 0
};

const Card = ({ zIndex = 0, children }) => (
    <div style={{ ...cardStyles, zIndex }}>{children}</div>
);
