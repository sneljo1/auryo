import logo from '@assets/img/auryo-dark.png';
import { remainingPlaysSelector } from '@common/store/app/selectors';
import { appVersionSelector } from '@common/store/selectors';
import * as os from 'os';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Modal, ModalBody } from 'reactstrap';
import { connectModal, InjectedProps } from 'redux-modal';
import './AboutModal.scss';

interface PassedProps {
  activeTab?: TabType;
}

enum TabType {
  ABOUT = 'about',
  SETTINGS = 'settings'
}

type Props = PassedProps & InjectedProps;

const UtilitiesModal: FC<Props> = ({ show, handleHide }) => {
  const remainingPlays = useSelector(remainingPlaysSelector);
  const version = useSelector(appVersionSelector);

  return (
    <Modal isOpen={show} toggle={handleHide} className="utilities">
      <ModalBody>
        <div className="close">
          <a href="javascript:void(0)" onClick={handleHide}>
            <i className="bx bx-x" />
          </a>
        </div>
        <div className="about mt-2">
          <section>
            <img className="logo" alt="logo" src={logo} />
          </section>
          <section className="app-info">
            <table className="container-fluid">
              <tbody>
                <tr>
                  <td>Version</td>
                  <td>{version}</td>
                </tr>
                <tr>
                  <td>Platform</td>
                  <td>{os.platform()}</td>
                </tr>
                <tr>
                  <td>Platform version</td>
                  <td>{os.release()}</td>
                </tr>
                <tr>
                  <td>Arch</td>
                  <td>{os.arch()}</td>
                </tr>
                <tr>
                  <td>Remaining plays</td>
                  <td>
                    <span className="bp3-tag bp3-intent-primary">
                      {remainingPlays ? remainingPlays.remaining || 'Unlimited' : 'Unknown'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="d-flex details justify-content-center align-items-center">
            <div>
              Created by <a href="https://www.linkedin.com/in/jonas-snellinckx/">Jonas Snellinckx</a>
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <i style={{ color: '#00aced' }} className="bx bxl-twitter color-twitter" />
              <a href="https://twitter.com/Auryoapp">@Auryoapp</a>
            </div>
          </section>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default connectModal({ name: 'utilities' })(UtilitiesModal);
