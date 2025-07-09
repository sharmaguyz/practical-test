import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;

  minDate?: Date;
  maxDate?: Date;
  excludeDates?: Date[];
  includeDates?: Date[];
  filterDate?: (date: Date) => boolean;

  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  minTime?: Date;
  maxTime?: Date;

  label?: string;
  placeholderText?: string;
  dateFormat?: string;
  className?: string;
  popperClassName?: string;
  calendarClassName?: string;
  wrapperClassName?: string;

  isClearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  withPortal?: boolean;

  error?: string;
  required?: boolean;
}

const CustomInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder, disabled, readOnly }, ref) => (
    <div className="relative w-full">
      <input
        type="text"
        onClick={onClick}
        ref={ref}
        value={value}
        onChange={() => {}}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className="w-full border px-3 py-2 pr-10 rounded"
      />
      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  )
);

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  onChange,

  minDate,
  maxDate,
  excludeDates,
  includeDates,
  filterDate,

  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeFormat = 'HH:mm',
  timeIntervals = 30,
  minTime,
  maxTime,

  label = 'Select Date',
  placeholderText = 'Choose a date',
  dateFormat = showTimeSelectOnly
    ? 'h:mm aa'
    : showTimeSelect
    ? 'MMMM d, yyyy h:mm aa'
    : 'MMMM d, yyyy',
  className = '',
  popperClassName = '',
  calendarClassName = '',
  wrapperClassName = '',

  isClearable = false,
  disabled = false,
  readOnly = false,
  withPortal = false,

  error,
  required = false,
}) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        excludeDates={excludeDates}
        includeDates={includeDates}
        filterDate={filterDate}
        showTimeSelect={showTimeSelect}
        showTimeSelectOnly={showTimeSelectOnly}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        minTime={minTime}
        maxTime={maxTime}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        className={className}
        popperClassName={popperClassName}
        calendarClassName={calendarClassName}
        isClearable={isClearable}
        disabled={disabled}
        readOnly={readOnly}
        withPortal={withPortal}
        customInput={<CustomInput />}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;
