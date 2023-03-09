type ValidationResult =
  | {
      isValid: true;
  }
  | {
      isValid: false;
      message: string;
  };

const inputValidationMap = {
    betInput: (value: string) => isBetInputValid(value),
};

export function isInputValid(
    value: string,
    type: keyof typeof inputValidationMap,
): ValidationResult {
    const res = inputValidationMap[type](value);
    return res;
}

function isBetInputValid(value: string): ValidationResult {
    const number = +value;
    if (Number.isNaN(number)) {
        return { isValid: false, message: "Enter a valid number" };
    }
    return number > 0
        ? { isValid: true }
        : { isValid: false, message: "The bet can't be equal or less than 0" };
}
