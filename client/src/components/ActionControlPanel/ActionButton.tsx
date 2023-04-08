/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import styles from "./styles.module.css";
import { useGame } from "../../context/GameContext";
import { useAction } from "./useAction";
import { ActionBtn } from "../../types/ui.types";

interface Props {
    item: ActionBtn;
}

export const ActionButton = observer(({ item }: Props) => {
    const { handleClick } = useAction();
    const game = useGame();
    const disabled = game.UI.isPlayerActionBtnDisabled(item.action);
    // const helperEnabled = game.UI.helperTarget.includes(item.action);

    return (
        <button
            type="button"
            className={styles.controlItem}
            onClick={() => handleClick(item.action)}
            disabled={disabled}
        >
            <div className={styles.helper} style={{ display: "none" }}>
                <svg width="50px" height="50px">
                    <defs>
                        <linearGradient
                            id={`bluegradient${item.action}`}
                            gradientUnits="userSpaceOnUse"
                            x1="50%"
                            x2="54.584%"
                            y1="29.143%"
                            y2="70.857%"
                        >
                            <stop stopColor="#7a6ded" offset="0%" />
                            <stop stopColor="#591885" offset="100%" />
                        </linearGradient>
                    </defs>
                    <TbTriangleInvertedFilled
                        color="orange"
                       // className={styles.helperIcon}
                        // style={{ color: `url(#${`bluegradient${item.action}`})` }}
                        // style={{ color: `url(#bluegradient${item.action})` }}
                        // color={`url(#bluegradient${item.action})`}
                        size={50}
                    />
                </svg>
            </div>
            <div className={styles.imgContainer}>
                <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
            </div>
            <div className={styles.textContainer}>{item.action}</div>
        </button>
    );
});
