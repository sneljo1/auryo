import fetchToJson from '@common/api/helpers/fetchToJson';
import React from 'react';
import Markdown from 'react-markdown';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { connectModal, InjectedProps } from 'redux-modal';
import Spinner from '../../../../_shared/Spinner/Spinner';
import './ChangelogModal.scss';

interface Props extends InjectedProps {
  version: string;
}

interface State {
  body: string;
  loading: boolean;
}

class ChangeLogModal extends React.PureComponent<Props, State> {
  public readonly state: State = {
    body: '',
    loading: false
  };

  public async componentDidMount() {
    this.setState({
      loading: true
    });

    return fetchToJson<{ body: string }>('https://api.github.com/repos/Superjo149/Auryo/releases/latest')
      .then(({ body }) => {
        this.setState({
          body,
          loading: false
        });
      })
      .catch(() => {
        this.setState({
          loading: false
        });
      });
  }

  public render() {
    const { show, handleHide, version } = this.props;
    const { body, loading } = this.state;

    return (
      <Modal visible={show} toggle={handleHide} className="changelog">
        <ModalHeader>
          <div className="close">
            <a href="javascript:void(0)" onClick={handleHide}>
              <i className="bx bx-x" />
            </a>
          </div>
          What's new {version} ? <span>🎉</span>
        </ModalHeader>
        <ModalBody>
          {loading && <Spinner contained />}

          <Markdown source={body} />

          <div className="text-center">
            <a href="https://github.com/Superjo149/auryo/releases" className="c_btn">
              older changelogs
            </a>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default connectModal({ name: 'changelog' })(ChangeLogModal as any);
