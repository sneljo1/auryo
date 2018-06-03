import {PROFILE_SERVICES} from "../../../../../shared/constants/index";
import "./artistProfiles.scss";
import React, {Component} from "react";
import PropTypes from "prop-types";

class ArtistProfiles extends Component {

    static getIcon(service) {

        switch (service) {
            case PROFILE_SERVICES.PERSONAL:
                return "globe";
            default:
                if (PROFILE_SERVICES[service.toUpperCase()] != null) {
                    return service
                }
                return "globe";
        }


    }

    static getTitle(title) {
        if (!title) return;
        switch (title.toLowerCase()) {
            case "spotify":
                return "spotify";
            case "youtube":
                return "youtube";
            case "pinterest":
                return "pinterest";
            case "snapchat":
                return "snapchat";
            default:
                return null;

        }
    }

    render() {
        const {profiles, className} = this.props;

        if (!profiles || !profiles.length) return null;

        return (
            <div id="web-profiles" className={className}>
                {
                    profiles.map(function (profile) {

                        const title = ArtistProfiles.getTitle(profile.title);
                        if (profile.service == "personal" && title) {
                            profile.service = title;
                        }

                        const icon = "icon-" + ArtistProfiles.getIcon(profile.service);

                        return (
                            <a href={profile.url}
                               className={"profile " + (profile.service && profile.service != null ? profile.service.toLowerCase() : "")}
                               key={profile.id}>
                                <i className={icon}/>
                                <span>{profile.title ? profile.title : profile.service}</span>
                            </a>
                        )
                    })
                }
            </div>
        )
    }
}

ArtistProfiles.propTypes = {
    profiles: PropTypes.array,
    className: PropTypes.string
};

export default ArtistProfiles;