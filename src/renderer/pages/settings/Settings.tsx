import { Button, Collapse, Switch } from "@blueprintjs/core";
import { EVENTS } from "@common/constants/events";
import { StoreState } from "@common/store";
import * as actions from "@common/store/actions";
import { ThemeKeys } from "@renderer/app/components/Theme/themes";
import PageHeader from "@renderer/_shared/PageHeader/PageHeader";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from "electron";
import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { CONFIG } from "../../../config";
import { CheckboxConfig } from "./components/CheckboxConfig";
import { InputConfig } from "./components/InputConfig";
import { SelectConfig } from "./components/SelectConfig";
import "./Settings.scss";
import { autobind } from "core-decorators";

const mapStateToProps = ({ config, auth, app }: StoreState) => ({
	config,
	authenticated: !!config.auth.token && !auth.authentication.loading,
	lastfmLoading: app.lastfmLoading
});

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			setConfigKey: actions.setConfigKey,
			setConfig: actions.setConfig,
			logout: actions.logout
		},
		dispatch
	);

interface Props {
	noHeader?: boolean;
}

interface State {
	restartMsg: boolean;
	advancedOpen: boolean;
	audioDevices: MediaDeviceInfo[];
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = Props & PropsFromState & PropsFromDispatch;

@autobind
class Settings extends React.PureComponent<AllProps, State> {
	public static defaultProps: Partial<AllProps> = {
		authenticated: false
	};

	public readonly state: State = {
		restartMsg: false,
		advancedOpen: false,
		audioDevices: []
	};

	public async componentDidMount() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const audioDevices = devices.filter(device => device.kind === "audiooutput");

		this.setState({
			audioDevices
		});
	}

	public restart() {
		ipcRenderer.send(EVENTS.APP.RESTART);
	}

	public isValidDirectory() {
		const { setConfigKey } = this.props;

		ipcRenderer.send(EVENTS.APP.VALID_DIR);
		ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (_event, dir: string) => {
			setConfigKey("app.downloadPath", dir);
		});
	}

	private handleClick() {
		const { advancedOpen } = this.state;

		this.setState({ advancedOpen: !advancedOpen });
	}

	private toggleLastFm(event: React.ChangeEvent<HTMLInputElement>) {
		const { setConfigKey } = this.props;

		setConfigKey("lastfm", event.target.checked ? {} : null);
	}

	private authorizeLastFm() {
		ipcRenderer.send(EVENTS.APP.LASTFM.AUTH);
	}

	private renderSettings() {
		const { config, authenticated } = this.props;
		const { restartMsg, advancedOpen } = this.state;

		return (
			<>
				{restartMsg && (
					<div className="info-message">
						A{" "}
						<a href="javascript:void(0)" onClick={this.restart}>
							restart
						</a>{" "}
						is required to enable/disable this feature.
					</div>
				)}

				{authenticated && this.renderAuthenticatedSettings()}

				<div className="setting-group">
					<div className="setting-group-title">Proxy (Experimental)</div>

					<div>
						<CheckboxConfig
							name="Enable proxy"
							configKey="enableProxy"
							{...this.props}
							onChange={(_value, setKey) => {
								this.setState({
									restartMsg: true
								});
								setKey();
							}}
						/>

						{config.enableProxy ? (
							<div className="container-fluid p-0 mt-2">
								<div className="form-group form-row">
									<InputConfig
										usePlaceholder
										className="col-8"
										name="Host"
										configKey="proxy.host"
										{...this.props}
									/>
									<InputConfig
										usePlaceholder
										className="col-4"
										name="Port"
										configKey="proxy.port"
										{...this.props}
									/>
								</div>
								<div className="form-group form-row">
									<InputConfig
										usePlaceholder
										className="col-6"
										name="Username"
										configKey="proxy.username"
										{...this.props}
									/>
									<InputConfig
										usePlaceholder
										className="col-6"
										name="Password"
										configKey="proxy.password"
										{...this.props}
									/>
								</div>
							</div>
						) : null}

						{authenticated && (
							<div className="mt-3">
								<Collapse isOpen={advancedOpen}>{this.renderAdvancedSettings()}</Collapse>
								<Button onClick={this.handleClick}>
									{advancedOpen ? "Hide" : "Show"} advanced settings
								</Button>
							</div>
						)}
					</div>
				</div>
			</>
		);
	}

	private renderAdvancedSettings() {
		const { setConfig, logout, config, setConfigKey } = this.props;

		const { audioDevices } = this.state;

		return (
			<div className="setting-group mt-2">
				<div className="setting-group-title">Advanced settings</div>

				<SelectConfig
					name="Audio output"
					setConfigKey={setConfigKey}
					config={config}
					data={[
						{ k: "Use device settings", v: null },
						...audioDevices.map(d => ({ k: d.label, v: d.deviceId }))
					]}
					configKey="audio.playbackDeviceId"
				/>

				<div className="setting">
					<a
						role="button"
						onClick={() => {
							setConfig(CONFIG.DEFAULT_CONFIG);
							logout();
						}}
						className="text-danger">
						Delete all settings
					</a>
				</div>
			</div>
		);
	}

	// tslint:disable-next-line: max-func-body-length
	private renderAuthenticatedSettings() {
		const { config, setConfigKey, lastfmLoading } = this.props;

		return (
			<>
				<div className="setting-group">
					<div className="setting-group-title">General</div>

					<div>
						<CheckboxConfig
							name="Send anonymous statistics"
							configKey="app.analytics"
							config={config}
							setConfigKey={setConfigKey}
						/>
						<CheckboxConfig
							name="Send crash reports"
							configKey="app.crashReports"
							config={config}
							setConfigKey={setConfigKey}
						/>

						<CheckboxConfig
							name="Show notification on track change"
							configKey="app.showTrackChangeNotification"
							config={config}
							setConfigKey={setConfigKey}
						/>

						<SelectConfig
							name="Theme"
							configKey="app.theme"
							setConfigKey={setConfigKey}
							config={config}
							data={Object.keys(ThemeKeys).map(theme => ({ k: theme, v: theme }))}
						/>

						<div className="setting d-flex justify-content-between align-items-center">
							<div>
								Download path
								<div className="value">
									{"app.downloadPath".split(".").reduce((o, i) => o[i], config)}
								</div>
							</div>
							<Button onClick={this.isValidDirectory}>Change directory</Button>
						</div>

						<InputConfig
							config={config}
							setConfigKey={setConfigKey}
							configKey="app.overrideClientId"
							type="text"
							name="Use your own clientId"
							placeholder="clientId"
							description={
								<div>
									Read <a href="https://github.com/Superjo149/auryo/wiki/Custom-clientId">here</a> why
									and how.
								</div>
							}
						/>
					</div>
				</div>

				<div className="setting-group">
					<div className="setting-group-title">Stream</div>

					<div>
						<CheckboxConfig
							name="Hide reposts"
							configKey="hideReposts"
							config={config}
							setConfigKey={setConfigKey}
							onChange={(_value, setKey) => {
								this.setState({
									restartMsg: true
								});
								setKey();
							}}
						/>
					</div>
				</div>
				<div className="setting-group">
					<div className="setting-group-title">Integrations</div>

					<div>
						<div className="setting d-flex justify-content-between align-items-start">
							<div>
								LastFm integration
								<div className="mt-1">
									{!!config.lastfm && (
										<>
											{config.lastfm && config.lastfm.key ? (
												<div className="value d-flex align-items-center">
													<span>Authorized as {config.lastfm.user}</span>
													<a
														role="button"
														onClick={() => setConfigKey("lastfm", null)}
														className="text-danger">
														<i className="bx bx-x" />
													</a>
												</div>
											) : (
												<Button loading={lastfmLoading} onClick={this.authorizeLastFm}>
													Authorize
												</Button>
											)}
										</>
									)}
								</div>
							</div>
							<div>
								<Switch
									alignIndicator="right"
									large
									checked={!!config.lastfm}
									onChange={this.toggleLastFm}
								/>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	public render() {
		return (
			<>
				<PageHeader title="Settings" />

				<div className="settingsWrapper">
					<div className="donationBox">
						<div className="iconWrapper">
							<i className="bx bxs-heart" />
						</div>
						<div>
							<strong>Are you enjoying this app as much as I am? Or even more?</strong>
							<div>
								I would love to spend more time on this, and other open-source projects. I do not earn
								anything off this project, so I would highly appreciate any financial contribution
								towards this goal.
								<a href="https://www.patreon.com/sneljo">Contribute now</a>
							</div>
						</div>
					</div>

					{this.renderSettings()}
				</div>
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
