import { remote } from 'electron';
import * as os from 'os';
import * as React from 'react';
import { RemainingPlays } from '../../../../../../../common/store/app';

const logo_url = require('../../../../../../../assets/img/auryo-dark.png');

interface Props {
    remainingPlays: RemainingPlays | null;
}

const AboutTab: React.SFC<Props> = ({ remainingPlays }) => (
    <div className='about mt-2'>
        <section>
            <img className='logo' src={logo_url} />
        </section>
        <section className='app-info'>
            <table className='container-fluid'>
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
                        <td><span className='bp3-tag bp3-intent-primary'>{remainingPlays ? remainingPlays.remaining : 'Unknown'}</span></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section className='d-flex details justify-content-center align-items-center'>
            <div>
                Created by <a href='https://www.linkedin.com/in/jonas-snellinckx/'>Jonas Snellinckx</a>
            </div>
            <div className='d-flex justify-content-center align-items-center'>
                <i
                    style={{ color: '#00aced' }}
                    className='bx bx-twitter color-twitter'
                />
                <a href='https://twitter.com/Auryoapp'>@Auryoapp</a>
            </div>
        </section>
    </div>
);

export default AboutTab;

