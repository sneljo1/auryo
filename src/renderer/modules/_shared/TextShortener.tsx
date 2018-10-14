import * as React from 'react';
import * as Marquee from 'react-marquee';
import * as ReactDotDotDot from 'react-dotdotdot';

interface Props {
    text: string;
    clamp?: number;
}

const TextShortener: React.SFC<Props> = ({ text, clamp }) => {
    if (clamp) {
        return (
            <ReactDotDotDot clamp={clamp}>{text}</ReactDotDotDot>
        );
    }

    return (
        <Marquee loop={true} text={text || ''} trailing={1500} />
    );
};

export default TextShortener;

