import React from "react";
import styles from "./styles.module.css";

export const Rules = () => {
    return (
        <div className={styles.rulesContainer}>
            <div className={styles.inner}>
                <p>Blackjack pays 3 to 2</p>
                <p>Dealer must stand on 17</p>
                <p>Insurance pays 2 to 1</p>
            </div>
        </div>
    );
};
