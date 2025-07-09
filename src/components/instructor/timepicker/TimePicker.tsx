// src/components/CourseDurationPicker.tsx

import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

type PropsType = {
  value: string | null;
  onChange: (value: string | null) => void;
  hourPlaceholder: string;
  minutePlaceholder: string;
  format: string;
};

const CourseDurationPicker = ({
  value,
  onChange,
  hourPlaceholder,
  minutePlaceholder,
  format,
}: PropsType) => {
  return (
    <div>
      <TimePicker
        value={value}
        onChange={onChange}
        format={format}
        hourPlaceholder	={hourPlaceholder}
        minutePlaceholder={minutePlaceholder}
        disableClock={true}
        className="w-full border border-gray-300 rounded-md text-sm p-2"
        clockIcon={null}
        clearIcon={null}
      />
    </div>
  );
};

export default CourseDurationPicker;
