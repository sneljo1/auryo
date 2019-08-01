import { Switch } from "@blueprintjs/core";
import { ConfigState, setConfigKey } from "@common/store/config";
import * as React from "react";

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    configKey: string;
    name?: string;
    alignIndicator?: "right" | "left" | "center";
    className?: string;
    onChange?(value: boolean, setKey: () => void): void;
}

class CheckboxConfig extends React.Component<Props> {

    public handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { configKey, setConfigKey, onChange } = this.props;

        if (onChange) {
            onChange(e.target.checked, () => {
                setConfigKey(configKey, e.target.checked);
            });
        } else {
            setConfigKey(configKey, e.target.checked);
        }
    }

    public render() {
        const { configKey, name, config, alignIndicator } = this.props;

        const value = configKey.split(".").reduce((o, i) => o[i], config);

        return (
            <div className="setting">
                <Switch
                    alignIndicator={alignIndicator || "right"}
                    large={true}
                    label={name}
                    checked={value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

export default CheckboxConfig;
