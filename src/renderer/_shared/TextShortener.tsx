import * as React from "react";
import * as ReactDotDotDot from "react-dotdotdot";
import * as Marquee from "react-marquee";

interface Props {
    text: string;
    clamp?: number;
}

const TextShortener = React.memo<Props>(({ text, clamp }) => {
    if (clamp) {
        return (
            <ReactDotDotDot clamp={clamp}>{text}</ReactDotDotDot>
        );
    }

    return (
        <Marquee loop={true} text={text || ""} trailing={1500} />
    );
});

export default TextShortener;

