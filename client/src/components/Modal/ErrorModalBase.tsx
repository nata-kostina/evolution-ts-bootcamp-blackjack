import React from "react";
import Modal from "react-modal";
import { ErrorModalProps } from "../../types/types";
import { getErrorModal } from "../../utils/getErrorModal";

export const ErrorModalBase = (props: ErrorModalProps) => {
    const ChildComponent = getErrorModal(props);
    const { closeModal, modalIsOpen } = props;
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
        >
            {ChildComponent}
        </Modal>
    );
};
