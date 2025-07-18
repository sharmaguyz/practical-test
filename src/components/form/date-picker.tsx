import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  error?: boolean;
  name?:string;
  minDate?: DateOption;
  maxDate?: DateOption;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  defaultValue,
  required=false,
  hint="",
  error=false,
  name,
  minDate,
  maxDate
}: PropsType) {
  useEffect(() => {
    const isTimeOnly = mode === "time";
  
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: isTimeOnly ? "H:i" : "Y-m-d",
      enableTime: isTimeOnly,
      noCalendar: isTimeOnly,
      time_24hr: isTimeOnly,
      minDate,
      maxDate, 
      onChange,
    });
  
    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, minDate, defaultValue, maxDate]);
  

  return (
    <div>
      {label && <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          name={name}
          defaultValue={defaultValue}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
      {hint && <small className={`text-${error ? 'red' : 'gray'}-500 text-xs mt-1`}>{hint}</small>}
    </div>
  );
}
