import React from 'react';
import Swipeable from 'react-swipy';
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
                        <div style={wrapperStyles}>
                            <Swipeable
                                buttons={({ right, left }) => (
                                    <div style={actionsStyles}>
                                    <Button onClick={left}>Reject</Button>
                                        <Button onClick={right}>Accept</Button>
                                    </div>
                                )}
                                onAfterSwipe={this.remove}>
                                <Card key={cards[0].sign}><KanjiCard data={cards[0]} /></Card>
                            </Swipeable>
                            {cards.length > 1 && <Card key={cards[1].sign} zIndex={-1}><KanjiCard data={cards[1]} /></Card>}
                        </div>
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

const buttonStyles = {
    padding: "16px 24px",
    background: "whitesmoke",
    cursor: "pointer",
    border: "none",
    borderRadius: 3
};

const Card = ({ zIndex = 0, children }) => (
    <div style={{ ...cardStyles, zIndex }}>{children}</div>
);

const Button = ({ children, onClick }) => (
    <button onClick={onClick} style={{ ...buttonStyles }}>
        {children}
    </button>
);
