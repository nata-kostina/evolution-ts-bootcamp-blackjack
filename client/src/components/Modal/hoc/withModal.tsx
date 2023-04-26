import React from "react";
import Modal from "react-modal";
import styles from "../styles.module.css";

export interface WithModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalStyle?: "basic" | "transparent";
}

export function withModal<P extends WithModalProps = WithModalProps>(Component: React.FC<P>): React.FC<P> {
    const NotificationWithModal: React.FC<P> = ({ isOpen, modalStyle, ...props }) => {
        return (
            <Modal
                isOpen={isOpen}
                shouldCloseOnOverlayClick={false}
                shouldCloseOnEsc={false}
                className={styles[modalStyle || "basic"]}
                data-testid="modal"
                style={{
                    overlay: {
                        zIndex: "1000",
                        backgroundColor: modalStyle === "transparent" ? "none" : "#ecececac",
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
