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
    noPlaceholder?: boolean;
}

const FallbackImage = React.memo<Props>(({ overflow, src, className, width, height, fallbackImage, noPlaceholder }) => (
    <div className={cn({ overflow })}>
        <LazyImage
            className={className}
            src={src}
            observerProps={{ rootMargin: '80px 0px' }}
            placeholder={({ ref }: any) => {
                if (!noPlaceholder) {
                    return (
                        <img
                            ref={ref}
                            className={className}
                            height={height}
                            width={width}
                            src={fallbackImage || defaultFallbackImage}
                        />
                    );
                }

                return <div ref={ref} />;
            }}
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
