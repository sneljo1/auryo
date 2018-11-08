import * as React from 'react';
import { initApp } from '../../../../common/store/app';
import './AppError.scss';

interface Props {
    error: string;
    initApp: typeof initApp;
}

const AppError = React.memo<Props>(({ error, initApp }) => (
    <div className='full-width-center'>
        <div>
            <h2>Oops</h2>
            <p className='alert alert-danger'>{error}</p>
            <a href='javascript:void(0)' className='btn btn-primary' onClick={initApp}>Reload</a>
        </div>
    </div>
));

export default AppError;
