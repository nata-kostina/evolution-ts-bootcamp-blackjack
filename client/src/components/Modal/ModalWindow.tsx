import React from "react";
import Modal from "react-modal";
import { ModalMap } from "../../constants/general";
import { ModalProps } from "../../types/types";

export const ModalWindow = ({ type, modalIsOpen, closeModal, afterOpenModal }: ModalProps) => {
    const ChildComponent = ModalMap[type]({ type, modalIsOpen, closeModal, afterOpenModal });
    return (
        <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
        >
            {ChildComponent}
        </Modal>
    );
};
