import React from 'react';
import Marquee from "react-marquee";

interface Props {
    text: string;
}

const TextShortener: React.SFC<Props> = ({ text }) => (
    <Marquee loop={true} text={text} trailing={1500} />
)

export default TextShortener;

