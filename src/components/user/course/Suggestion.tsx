"use client";
type SuggestionProps = {
  suggestions: { courseName: string }[];
  showSuggestions: boolean;
  onSelect: (courseName: string) => void;
};
export default function Suggestion({
  suggestions,
  showSuggestions,
  onSelect,
}: SuggestionProps) {
  if (!showSuggestions || suggestions.length === 0) return null;
 return (
    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-y-auto text-sm">
      {suggestions.map((sugg, idx) => (
        <li
          key={idx}
          onClick={() => onSelect(sugg.courseName)} // send back course name string
          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
        >
          {sugg.courseName}
        </li>
      ))}
    </ul>
  );
}
