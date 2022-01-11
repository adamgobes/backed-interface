import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent, useCallback } from 'react';

type SearchTextInputProps = {
  label: string;
  placeholder: string;
  setTextValue: (token: string) => void;
  transformer?: (old: string) => string;
};

export default function SearchTextInput({
  label,
  placeholder,
  setTextValue,
  transformer = (old: string) => old,
}: SearchTextInputProps) {
  const handleTextInputChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.trim();

      if (newValue.length < 3) {
        setTextValue('');
      } else {
        setTextValue(transformer(newValue));
      }
    },
    [setTextValue, transformer],
  );

  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputLabel}>{label}</div>
      <div className={styles.inputs}>
        <label>
          <Input
            onChange={(event) => handleTextInputChanged(event)}
            placeholder={placeholder}
          />
        </label>
      </div>
    </div>
  );
}
