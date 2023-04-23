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
                shouldCloseOnEsc={false}
                className={styles.modal}
                data-testid="modal"
                style={{
                    overlay: {
                        zIndex: "1000",
                    },
                }}
            >
                <div className={styles.inner}>
                    <Component {...props as P} />
                </div>
            </Modal>
        );
    };

    return NotificationWithModal;
}
