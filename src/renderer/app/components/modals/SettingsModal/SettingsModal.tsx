import Settings from "@renderer/pages/settings/Settings";
import * as React from "react";
import { Modal, ModalBody } from "reactstrap";
import { connectModal, InjectedProps } from "redux-modal";
import "./SettingsModal.scss";

type Props = InjectedProps;

class SettingsModal extends React.PureComponent<Props> {
	public render() {
		const { show, handleHide } = this.props;

		return (
			<Modal visible={show} toggle={handleHide} className="settings">
				<div className="close">
					<a href="javascript:void(0)" onClick={handleHide}>
						<i className="bx bx-x" />
					</a>
				</div>
				<ModalBody>
					<Settings noHeader />
				</ModalBody>
			</Modal>
		);
	}
}

export default connectModal({ name: "settings" })(SettingsModal as any);
