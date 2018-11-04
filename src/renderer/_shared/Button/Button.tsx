import * as React from 'react';
import cn from 'classnames';
import './Button.scss';

interface Props {
    color: 'primary' | 'danger' | 'success' | 'warning';
    block: boolean;
    loading: boolean;
    children: React.ReactNode;
    [key: string]: any;
}

const Button = React.memo<Props>(({ loading, color, block, children, ...rest }) => (
    <a
        className={cn(`btn btn-${color}`, {
            'btn-block': block,
            loading
        })}
        {...rest}
    >
        {
            loading ? [
                <div key='loader' className='circle-loader' />,
                <span key='text'>Loading</span>
            ] : children
        }

    </a>
));

export default Button;
