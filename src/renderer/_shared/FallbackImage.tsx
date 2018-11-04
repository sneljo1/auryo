import cn from 'classnames';
import * as React from 'react';
import { LazyImage } from 'react-lazy-images';

const defaultFallbackImage = require('../../assets/img/placeholder.jpg');

interface Props {
    src: string;
    height?: number;
    width?: number;
    overflow?: boolean;
    className?: string;
    fallbackImage?: string;
}

const FallbackImage = React.memo<Props>(({ overflow, src, className, width, height, fallbackImage }) => (
    <div className={cn({ overflow })}>
        <LazyImage
            // observerProps={{ threshold: 0.01, rootMargin: '200px 0px 0px 0px' }}
            className={className}
            src={src}
            placeholder={({ ref }: any) => (
                <img
                    ref={ref}
                    className={className}
                    height={height}
                    width={width}
                    src={fallbackImage || defaultFallbackImage}
                />
            )}
            error={() => (
                <img
                    className={className}
                    height={height}
                    width={width}
                    src={fallbackImage || defaultFallbackImage}
                />
            )}
            actual={({ imageProps }: any) => (
                <img
                    {...imageProps}
                    height={height}
                    width={width}
                />
            )}
        />
    </div>
));

export default FallbackImage;
