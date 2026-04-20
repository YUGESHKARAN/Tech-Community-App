
const PillLoader = () => {
  return (
    <div className="flex w-full px-3  md:w-fit md:max-w-7xl mt-1  py-3 md:py-5 z-50 scrollbar-hide mx-auto items-center justify-start gap-3 overflow-x-auto">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="h-5 md:h-7 w-20 md:w-24 rounded-md bg-gray-700"
        />
      ))}
    </div>
  );
};


export default PillLoader