import React from 'react';
import './AppError.scss';

interface Props {
  error: string;
  reload(): void;
}

const AppError = React.memo<Props>(({ error, reload }) => (
  <div className="full-width-center">
    <div>
      <h2>Oops</h2>
      <p className="alert alert-danger">{error}</p>
      <a href="javascript:void(0)" className="btn btn-primary" onClick={reload}>
        Reload
      </a>
    </div>
  </div>
));

export default AppError;
