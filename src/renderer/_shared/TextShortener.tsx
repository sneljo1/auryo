import React from 'react';
import ReactDotDotDot from 'react-dotdotdot';
import Marquee from 'react-marquee';

interface Props {
  text: string;
  clamp?: number;
}

export const TextShortener = React.memo<Props>(({ text, clamp }) => {
  if (clamp) {
    return <ReactDotDotDot clamp={clamp}>{text}</ReactDotDotDot>;
  }

  return <Marquee loop text={text || ''} trailing={1500} />;
});
