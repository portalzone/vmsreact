const ResponsiveTable = ({ children }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-w-full">
        <div className="inline-block min-w-full align-middle">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTable;