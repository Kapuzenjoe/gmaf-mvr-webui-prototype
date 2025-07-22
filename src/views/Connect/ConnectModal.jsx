import React, { useState } from 'react';
import styles from './ConnectStatusView.module.css';

/**
 * A modal dialog component for configuring the MMIR connection settings.
 * Allows the user to input and update the MMIR URL and App Key.
 *
 * @param {object} props
 * @param {object} props.config - Initial configuration object with `mmirUrl` and `appKey`.
 * @param {function} props.onSave - Callback to save the updated configuration.
 * @param {function} props.onClose - Callback to close the modal.
 */
function ConnectModal({ config, onSave, onClose }) {
    const [localConfig, setLocalConfig] = useState(config);

    /**
     * Handles changes in input fields and updates localConfig state.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the input.
     */
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setLocalConfig((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handles save button click.
     */
    const handleSave = () => {
        onSave(localConfig);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Configure connection</h3>
                <input
                    name="mmirUrl"
                    placeholder="MMIR System URL"
                    value={localConfig.mmirUrl}
                    onChange={handleInputChange}
                    autoFocus
                />
                <input
                    name="appKey"
                    placeholder="App Key"
                    value={localConfig.appKey}
                    onChange={handleInputChange}
                />
                <button onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}

export default ConnectModal;
