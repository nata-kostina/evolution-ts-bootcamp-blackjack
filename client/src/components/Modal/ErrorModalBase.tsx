import React from "react";
import Modal from "react-modal";
import { ErrorModalProps } from "../../types/types";
import { GameErrorModal } from "./GameErrorModal";

export const ErrorModalBase = (props: ErrorModalProps) => {
    const { closeModal, modalIsOpen } = props;
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
        >
            <GameErrorModal />
        </Modal>
    );
};
