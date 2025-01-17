import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent } from 'react';

type LoanNumericInputProps = {
  setMin: (val: number) => void;
  setMax: (val: number) => void;
  label: string;
  error?: string;
};

const handleNumericChanged = (
  event: ChangeEvent<HTMLInputElement>,
  setValue: (val: number) => void,
) => {
  const newValue = parseInt(event.target.value.trim());
  if (isNaN(newValue)) {
    setValue(0);
  } else {
    setValue(parseInt(event.target.value.trim()));
  }
};

export default function LoanNumericInput({
  setMin,
  setMax,
  label,
  error,
}: LoanNumericInputProps) {
  return (
    <div className={styles.inputWrapper}>
      <span>{label}</span>
      <div className={`${styles.numericInputGroup}`}>
        <label>
          <Input
            type="number"
            onChange={(event) => handleNumericChanged(event, setMin)}
            placeholder="Min"
          />
        </label>
        <span className={styles.to}>to</span>
        <label>
          <Input
            type="number"
            onChange={(event) => handleNumericChanged(event, setMax)}
            placeholder="Max"
          />
        </label>
      </div>
      {error && <div className={styles.errors}>{error}</div>}
    </div>
  );
}
