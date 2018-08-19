import { remote } from 'electron';
import os from 'os';
import React from 'react';
import logo_url from '../../../../assets/img/auryo-dark.png';
import './about.scss';

const AboutTab = () => (
    <div className="about mt-2">
        <section>
            <img className="logo" src={logo_url} />
        </section>
        <section>

            <ul className="app-info">
                <li>
                    <span className="key">Version</span>
                    <span>{remote.app.getVersion()}</span>
                </li>
                <li>
                    <span className="key">Platform</span>
                    <span>{os.platform()}</span>
                </li>
                <li>
                    <span className="key">Platform version</span>
                    <span>{os.release()}</span>
                </li>
                <li>
                    <span className="key">Arch</span>
                    <span>{os.arch()}</span>
                </li>
            </ul>
        </section>

        <section className="d-flex details justify-content-center">
            <div>
                Created by <a href="https://www.linkedin.com/in/jonas-snellinckx/">Jonas Snellinckx</a>
            </div>
            <div>
                <i style={{ color: '#00aced' }} className="icon-twitter color-twitter" /> <a
                    href="https://twitter.com/Auryoapp">@Auryoapp</a>
            </div>
        </section>
    </div>
)

export default AboutTab