import React, { Component } from 'react';
import styles from './ConnectStatusView.module.css';
import { FaCog } from 'react-icons/fa';
import ConnectModal from './ConnectModal';

import MMIRConnector from '../../service/MMIRConnector';

/**
 * View component that handles the connection state to an MMIR system.
 * Provides a UI for configuring and initiating the connection.
 */
class ConnectStatusView extends Component {
    /**
     * @param {object} props - React props
     */
    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            showModal: false,
            config: {
                mmirUrl: 'http://localhost:8482/gmaf/gmafApi', //default
                appKey: 'stw476', //default
            },
        };
    }

    /**
     * Validates string format for URL and appKey fields.
     * @param {string} str
     * @returns {boolean}
     */
    isValidInput = (str) => typeof str === 'string' && /^[\w\-.:/]+$/.test(str);


    /**
     * Attempts to connect to the MMIR system using the provided configuration.
     * Sets base URL and fetches token. Updates connection state accordingly.
     */
    connectMMIR = async () => {
        const { mmirUrl, appKey } = this.state.config;

        if (!mmirUrl || !appKey) {
            alert('Please enter MMIR URL and AppKey.');
            return;
        }

        if (!this.isValidInput(mmirUrl) || !this.isValidInput(appKey)) {
            alert('Invalid characters in MMIR URL or AppKey.');
            return;
        }

        MMIRConnector.setBaseUrl(mmirUrl);

        try {
            const token = await MMIRConnector.getToken(appKey);
            console.log('Successfully connected. Token:', token);
            this.setState({ isConnected: true });
        } catch (err) {
            alert('Connection failed: ' + err.message);
            this.setState({ isConnected: false });
        }
    };

    /**
     * Callback to handle configuration save from modal.
     * @param {object} newConfig - The updated configuration object.
     */
    handleModalSave = (newConfig) => {
        this.setState({ config: newConfig, showModal: false });
    };

    /**
     * Renders the connection view, including buttons, status display, and modal dialog.
     * @returns {JSX.Element}
     */
    render() {
        const { isConnected, showModal, config } = this.state;

        return (
            <div className="view-container">
                <div className="view-header">Connector</div>

                <div className={styles.content}>
                    <button onClick={this.connectMMIR}>
                        Connect
                    </button>
                    <button onClick={() => this.setState({ showModal: true })}>
                        <FaCog />
                    </button>
                </div>

                {isConnected ? (
                    <div className={`${styles.status} ${styles.connected}`}>
                        Connected with: {config.mmirUrl}
                    </div>
                ) : (
                    <div className={`${styles.status} ${styles.disconnected}`}>
                        Disconnected
                    </div>
                )}

                {showModal && (
                    <ConnectModal
                        config={config}
                        onSave={this.handleModalSave}
                        onClose={() => this.setState({ showModal: false })}
                    />
                )}
            </div>
        );
    }
}

export default ConnectStatusView;
