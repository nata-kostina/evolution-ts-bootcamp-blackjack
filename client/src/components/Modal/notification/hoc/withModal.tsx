import React from "react";
import Modal from "react-modal";
import styles from "../styles.module.css";

export interface WithModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function withModal<P extends WithModalProps = WithModalProps>(Component: React.FC<P>): React.FC<P> {
    const NotificationWithModal: React.FC<P> = ({ isOpen, ...props }) => {
        return (
            <Modal
                isOpen={isOpen}
                shouldCloseOnOverlayClick={false}
                contentLabel="Example Modal"
                shouldCloseOnEsc={false}
                className={styles.modal}
            >
                <div className={styles.inner}>
                    <Component {...props as P} />
                    {/* <button type="button" onClick={onClose} className={styles.closeBtn}>X</button> */}
                </div>
            </Modal>
        );
    };

    return NotificationWithModal;
}
