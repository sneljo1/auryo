import cn from "classnames";
import * as React from "react";
import { LazyImage } from "react-lazy-images";
import defaultFallbackImage from "@assets/img/placeholder.jpg";

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
			src={src}
			observerProps={{ rootMargin: "80px 0px" }}
			placeholder={({ ref }: any) => {
				if (!noPlaceholder) {
					return (
						<img
							ref={ref}
							className={className}
							height={height}
							width={width}
							src={fallbackImage || defaultFallbackImage}
							alt=""
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
					alt=""
				/>
			)}
			actual={({ imageProps }: any) => <img {...imageProps} height={height} width={width} alt="" />}
		/>
	</div>
));

export default FallbackImage;
