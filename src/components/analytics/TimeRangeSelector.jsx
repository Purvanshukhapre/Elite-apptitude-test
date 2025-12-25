
const TimeRangeSelector = ({ timeRange, setTimeRange }) => {
  return (
    <div className="mb-6 flex justify-end">
      <select 
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="24hours">Last 24 Hours</option>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="90days">Last 90 Days</option>
      </select>
    </div>
  );
};

export default TimeRangeSelector;