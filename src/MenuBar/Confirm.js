import React from 'react';
import './Confirm.css';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <p>{message}</p>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={onConfirm}>Confirm</button>
                    {(onCancel && <button className="cancel-button" onClick={onCancel}>Cancel</button>)}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;