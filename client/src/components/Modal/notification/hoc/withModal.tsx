import React from "react";
import Modal from "react-modal";

export interface WithModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function withModal<P extends WithModalProps = WithModalProps>(Component: React.FC<P>): React.FC<P> {
    const NotificationWithModal: React.FC<P> = ({ isOpen, ...props }) => {
        const { onClose } = props;
        return (
            <Modal
                isOpen={isOpen}
                shouldCloseOnOverlayClick={false}
                contentLabel="Example Modal"
                shouldCloseOnEsc={false}
            >
                <Component {...props as P} />
                <button type="button" onClick={onClose}>X</button>
            </Modal>
        );
    };

    return NotificationWithModal;
}
