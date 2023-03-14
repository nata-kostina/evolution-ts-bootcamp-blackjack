import React from "react";
import { GameErrorModal } from "../components/Modal/GameErrorModal";
import { ErrorModalProps, GameError } from "../types/types";
import { PlayerErrorModal } from "../components/Modal/PlayerErrorModal";

export const getErrorModal = (props: ErrorModalProps) => {
    const { type, ...restProps } = props;
    switch (type) {
        case GameError.GameError:
            return (<GameErrorModal {...restProps} />);
        case GameError.PlayerError:
            return (<PlayerErrorModal {...restProps} />);
        default:
            return <></>;
    }
};
