import cn from 'classnames';
import React from 'react';
import './PageHeader.scss';

interface Props {
  image?: string | null;
  gradient?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader = React.memo<Props>(({ image, gradient, children, title, subtitle }) => (
  <div
    className={cn('page-header ', {
      withImage: image
    })}>
    {image && <div className="bgImage" style={{ backgroundImage: `url(${image})` }} />}
    {gradient && <div className="gradient" style={{ backgroundImage: gradient }} />}

    <div className="header-content">
      {title ? <h2>{title}</h2> : children}
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </div>
  </div>
));

export default PageHeader;
