import React, { useState } from "react";
import "./styles.css";
import { observer } from "mobx-react-lite";
import { player } from "../../store/index";
import { isInputValid } from "../../utils/validation/InputLayerValidation";
import { formatStringToNumber } from "../../utils/formatting/InputLayerFromatting";
import { betsSet } from "../../constants/gameConstants";

export const BetsForm = observer(() => {
    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (value: string) => {
        const result = isInputValid(value, "betInput");
        if (result.isValid) {
            setInputValue(value);
            if (errorMessage) {
                setErrorMessage("");
            }
        } else {
            setInputValue("");
            setErrorMessage(result.message);
        }
    };

    const handleBetClick = (bet: number) => {
        player.addBet(bet);
    };

    const handleInputSubmit = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        e.preventDefault();
        const bet = formatStringToNumber(inputValue);
        player.addBet(bet);
        setInputValue("");
    };

    const handleUndoBet = () => {
        player.undoBet();
    };

    const handleClearClick = () => {
        player.clearBets();
    };

    return (
        <div>
            {errorMessage && <div>{errorMessage}</div>}
            <h2>Place your bets please</h2>
            <form>
                <div>
                    <div>Default bets</div>
                    <ul className="bets-list">
                        {betsSet.map((item) => (
                            <li key={item.id} className="bets-item" onClick={() => handleBetClick(item.value)}>
                                {item.value}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div>Custom bet</div>
                    <div>
                        <label>
                            <input
                                type="text"
                                placeholder="Enter your bet"
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                            />
                        </label>
                        <button onClick={handleInputSubmit} type="submit">
                            Place bet
                        </button>
                    </div>
                </div>
                <button type="button" onClick={handleUndoBet}>
                    Undo bet
                </button>
                <button type="button" onClick={handleClearClick}>
                    Clear bets
                </button>
            </form>
        </div>
    );
});
