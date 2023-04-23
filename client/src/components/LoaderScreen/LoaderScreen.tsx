import React from "react";
import { ReactSVG } from "react-svg";
import LogoSVG from "../../assets/img/logo.svg";
import styles from "./styles.module.css";

export const LoaderScreen = () => {
    return (
        <div className={styles.loaderContainer} data-testid="loaderContainer">
            <div className={styles.logo}>
                <div className={styles.imgContainer}>
                    <ReactSVG src={LogoSVG} />
                </div>
                <h1 className={styles.title}>BLACKJACK</h1>
            </div>
        </div>
    );
};
