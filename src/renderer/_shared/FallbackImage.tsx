import cn from 'classnames';
import React from 'react';
import defaultFallbackImage from '@assets/img/placeholder.jpg';

interface Props {
  src: string;
  height?: number;
  width?: number;
  fluid?: boolean;
  overflow?: boolean;
  className?: string;
  fallbackImage?: string;
  noPlaceholder?: boolean;
}

const FallbackImage = React.memo<Props>(({ fluid, overflow, src, className, width, height, fallbackImage }) => (
  <div className={cn({ overflow })}>
    <picture>
      <source srcSet={src} />
      <img
        className={cn(className, { 'img-fluid': fluid })}
        width={width}
        height={height}
        alt=""
        src={fallbackImage || defaultFallbackImage}
        loading="lazy"
      />
    </picture>
  </div>
));

export default FallbackImage;
