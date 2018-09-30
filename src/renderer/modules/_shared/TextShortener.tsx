import React from 'react';
import TextTruncate from 'react-dotdotdot';

interface Props {
    text: string;
}

// TODO implement text carousel like spotify
class TextShortener extends React.Component<Props>{

    onMouseEnter = () => {

    }

    onMouseLeave = () => {

    }

    render() {
        const { text } = this.props;

        return (
            <span
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}>
                <TextTruncate
                    clamp={1}>
                    {text}
                </TextTruncate>
            </span>
        );
    }
}

export default TextShortener;

