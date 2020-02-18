import logo from '@assets/img/auryo-dark.png';
import { StoreState } from '@common/store';
// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';
import * as os from 'os';
import React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody } from 'reactstrap';
import { compose } from 'redux';
import { connectModal, InjectedProps } from 'redux-modal';
import './AboutModal.scss';

const mapStateToProps = ({ app }: StoreState) => ({
  remainingPlays: app.remainingPlays
});

interface PassedProps {
  activeTab?: TabType;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

enum TabType {
  ABOUT = 'about',
  SETTINGS = 'settings'
}

type Props = PropsFromState & PassedProps & InjectedProps;

class UtilitiesModal extends React.PureComponent<Props> {
  public render() {
    const { show, handleHide, remainingPlays } = this.props;

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
                    <td>{remote.app.getVersion()}</td>
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
  }
}

export default compose(connectModal({ name: 'utilities' }), connect(mapStateToProps))(UtilitiesModal);
