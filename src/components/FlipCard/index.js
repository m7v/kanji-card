import './index.css';
import React from 'react';
import cx from 'classnames';

class FlipCard extends React.PureComponent {
    render() {
        const className = cx({
            'FlipCard': true,
            'FlipCard__flipped': this.props.isFlipped,
        });
        return (
            <div className={className}>
                <div className="FlipCard__Flipper">
                    <div className="FlipCard__Front">
                        {this.props.children[ 0 ]}
                    </div>
                    <div className="FlipCard__Back">
                        {this.props.children[ 1 ]}
                    </div>
                </div>
            </div>
        );
    }
}

export default FlipCard;
