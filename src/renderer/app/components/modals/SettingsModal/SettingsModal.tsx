import Settings from '@renderer/pages/settings/Settings';
import * as React from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { connectModal, IModalInjectedProps } from 'redux-modal';
import './SettingsModal.scss';

interface Props {
}

interface State {

}

class SettingsModal extends React.PureComponent<Props & IModalInjectedProps, State> {
    render() {
        const { show, handleHide } = this.props;

        return (
            <Modal isOpen={show} toggle={handleHide} className='settings'>
                <div className='close'>
                    <a href='javascript:void(0)' onClick={handleHide}><i className='bx bx-x' /></a>
                </div>
                <ModalBody>
                    <Settings
                        noHeader={true}
                    />
                </ModalBody>
            </Modal>
        );
    }
}

export default connectModal({ name: 'settings' })(SettingsModal as any);
