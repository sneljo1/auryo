import feetonmusicbox from "@assets/img/feetonmusicbox.jpg";
import { StoreState } from "@common/store";
import * as actions from "@common/store/actions";
import AboutModal from "@renderer/app/components/modals/AboutModal/AboutModal";
import cn from "classnames";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from "electron";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import * as ReduxModal from "redux-modal";
import { LoginStep } from "./components/LoginStep";
import { PrivacyStep } from "./components/PrivacyStep";
import { WelcomeStep } from "./components/WelcomeStep";
import "./OnBoarding.scss";

const mapStateToProps = (state: StoreState) => ({
	...state.auth.authentication,
	config: state.config
});

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			login: actions.login,
			show: ReduxModal.show,
			setConfigKey: actions.setConfigKey
		},
		dispatch
	);

type OwnProps = RouteComponentProps;

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
	step: "welcome" | "login" | "privacy";
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class OnBoarding extends React.PureComponent<AllProps, State> {
	public state: State = {
		step: "login"
	};

	public componentDidMount() {
		const {
			config: { lastLogin }
		} = this.props;

		if (!lastLogin) {
			ipcRenderer.once("login-success", () => {
				this.setState({
					step: "welcome"
				});
			});
		}
	}

	public login = () => {
		const { login, loading } = this.props;

		if (!loading) {
			login();
		}
	};

	public render() {
		const { loading, error, show, config, setConfigKey, history } = this.props;
		const { step } = this.state;

		return (
			<div id="login" className={cn("login", { login_small: step === "login" })}>
				<div className="login_svg">
					<svg preserveAspectRatio="xMinYMin meet" viewBox="442.89 75.141 1923 1204.859">
						<defs>
							<pattern id="image" x="0" y="0" width="1" height="1">
								<image
									xlinkHref={feetonmusicbox}
									width="1923"
									height="1204.859"
									preserveAspectRatio="none"
								/>
							</pattern>
						</defs>
						<path
							// tslint:disable-next-line:max-line-length
							d=" M 1492.89 76.729 C 1494.781 76.669 1491.009 76.751 1492.89 76.729 Q 1688.207 74.452 1819.89 350.603 Q 1816.865 344.209 1819.89 350.603 Q 2002.369 736.338 2358.89 777.603 L 2365.89 1279.999 Q 442.89 1280.001 442.89 1279.999 C 446.431 1068.715 588.71 855.833 711.652 708.742 C 804.759 575.761 875.829 694.161 930.09 515.844 Q 932.515 507.875 934.89 499.603 Q 934.805 500.031 934.89 499.603 Q 1024.781 49.177 1492.89 76.729"
							fill="url(#image)"
						/>
					</svg>
				</div>

				<div className="row d-flex align-items-center">
					<div className={`login-wrap col-12 ${step !== "login" ? "col-md-6" : "col-md-5"}`}>
						{step === "login" && (
							<LoginStep loading={loading} error={error} show={show} login={this.login} />
						)}

						{step === "welcome" && (
							<WelcomeStep
								onNext={() => {
									this.setState({
										step: "privacy"
									});
								}}
							/>
						)}

						{step === "privacy" && (
							<PrivacyStep
								config={config}
								setConfigKey={setConfigKey}
								onNext={() => {
									history.replace("/");
								}}
							/>
						)}
					</div>
				</div>
				<AboutModal />
			</div>
		);
	}
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
	mapStateToProps,
	mapDispatchToProps
)(OnBoarding);
