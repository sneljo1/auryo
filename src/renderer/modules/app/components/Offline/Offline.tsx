import * as React from 'react';
import { Alert } from 'reactstrap';
import Spinner from '../../../_shared/Spinner/Spinner';

interface Props {
    full: boolean;
}

class Offline extends React.PureComponent<Props> {
    render() {
        const { full } = this.props;

        if (!full) {
            return (
                <div className='offline'>
                    <Alert color='info' className='m-a-0'>
                        <i className='bx bx-error-circle' /> You are currently offline, please reconnect!
                    </Alert>

                </div>

            );
        }
        return (
            <div className='offline full'>
                <div className='img-overlay' style={{ backgroundImage: 'url(assets/img/feetonmusicbox.jpg)' }} />
                <div className='offline-content'>
                    <h2>You seem to be offline</h2>
                    <p>But we got this, you just have to reconnect.</p>
                    <Spinner />
                </div>
            </div>

        );
    }
}

export default Offline;
