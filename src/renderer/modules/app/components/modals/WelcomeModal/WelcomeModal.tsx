import React from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { connectModal, IModalInjectedProps } from 'redux-modal';
import imgUrl from '../../../../../../assets/img/boombox.svg';

class WelcomeModal extends React.PureComponent<IModalInjectedProps> {
    render() {
        const { show, handleHide } = this.props;

        return (
            <Modal isOpen={show} toggle={handleHide} className='welcome'>
                <ModalBody>
                    <h2>Welcome to Auryo</h2>
                    <img className='logo' src={imgUrl} />
                    <div className='welcome__description'>
                        Due to the limitations of SoundClouds APIs, we are limited to 15K streams/day. After this, there will be a waiting period where
                        no music can be listened. Also some music may not be available in the desktop version because every song owner has the option to disable
                        access for third party applications such as this one.
                    </div>

                    <a href='javascript:void(0)' onClick={handleHide} className='btn btn-primary d-block'>Let's go</a>
                </ModalBody>
            </Modal>
        );
    }
}

export default connectModal({ name: 'welcome' })(WelcomeModal as any);
