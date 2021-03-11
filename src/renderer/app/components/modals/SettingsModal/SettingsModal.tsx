import { Settings } from '@renderer/pages/settings/Settings';
import React, { FC } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { connectModal, InjectedProps } from 'redux-modal';
import './SettingsModal.scss';

type Props = InjectedProps;

const SettingsModal: FC<Props> = ({ show, handleHide }) => {
  return (
    <Modal isOpen={show} toggle={handleHide} className="settings">
      <div className="close">
        <a href="javascript:void(0)" onClick={handleHide}>
          <i className="bx bx-x" />
        </a>
      </div>
      <ModalBody>
        <Settings />
      </ModalBody>
    </Modal>
  );
};

export default connectModal({ name: 'settings' })(SettingsModal);
