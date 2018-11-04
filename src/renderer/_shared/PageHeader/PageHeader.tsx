import * as React from 'react';
import cn from 'classnames';
import './PageHeader.scss';

interface Props {
    image?: string;
    gradient?: string;
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
}

const PageHeader = React.memo<Props>(({ image, gradient, children, title, subtitle }) => (
    <div
        className={cn('page-header ', {
            withImage: image
        })}
    >
        {image && (
            <div
                className='bgImage'
                style={{ backgroundImage: `url(${image})` }}
            />
        )}
        {gradient && (
            <div className='gradient' style={{ backgroundImage: gradient }} />
        )}

        <div className='header-content'>
            {subtitle && (<div className='subtitle'>{subtitle}</div>)}
            {title ? (<h2>{title}</h2>) : children}
        </div>
    </div>
));

export default PageHeader;
