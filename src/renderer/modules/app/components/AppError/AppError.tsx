import React from 'react';
import { initApp } from '../../../../../shared/store/app';

interface Props {
    error: string;
    initApp: typeof initApp;
}

class AppError extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {
        const { error } = this.props;

        return error !== nextProps.error;
    }

    render() {
        const { error, initApp } = this.props;

        // TODO fancify

        return (
            <div className='full-width-center'>
                <div>
                    <h2>Oops</h2>
                    <p className='alert alert-danger'>{error}</p>
                    <a href='javascript:void(0)' className='btn btn-primary' onClick={initApp}>Reload</a>
                </div>
            </div>
        );
    }
}

export default AppError;
