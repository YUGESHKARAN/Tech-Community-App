
const PillLoader = () => {
  return (
    <div className="flex md:max-w-5xl md:w-fit mt-12 mx-auto items-center justify-start gap-3 mb-5 overflow-x-auto scrollbar-hide animate-pulse">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="h-7 md:h-9 w-20 md:w-24 rounded-md bg-gray-700"
        />
      ))}
    </div>
  );
};


export default PillLoader