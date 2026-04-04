

const StudentLoader = ({roleFilter}) => {

    return (
          <div
  className={`${
    roleFilter === ""
      ? "h-auto md:mb-16 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
      : roleFilter === "admin"
      ? "min-h-screen md:mb-16 mb-10 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
      : "hidden"
  } animate-pulse`}
>
  {Array.from({ length: 6 }).map((_, index) => (
    <div
      key={index}
      className="bg-gray-900 w-full p-4 flex flex-col justify-between rounded-lg shadow-md border border-neutral-700"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-start gap-2 w-full">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-700 shrink-0" />

          {/* Name + Email */}
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 bg-gray-700 rounded" />
            <div className="h-2 w-40 bg-gray-800 rounded" />
          </div>
        </div>

        {/* Delete Icon */}
        <div className="w-4 h-4 bg-gray-700 rounded" />
      </div>

      {/* Stats */}
      {/* <div className="md:flex grid flex-wrap gap-3 mb-4">
        <div className="h-2 w-20 bg-gray-800 rounded" />
        <div className="h-2 w-24 bg-gray-800 rounded" />
        <div className="h-2 w-16 bg-gray-800 rounded" />
      </div> */}

      {/* Role + Button */}
      <div className="flex items-center gap-3">
        <div className="md:h-8 md:w-28 h-5 w-20 bg-gray-800 rounded-md" />
        <div className="md:h-8 md:w-24 h-5 w-20 bg-gray-700 rounded-md" />
      </div>
    </div>
  ))}
</div>
    )
}


export default StudentLoader;