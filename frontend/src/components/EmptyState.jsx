
export const EmptyState = ({ image, title="", description="", action="" }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
    <img
      src={image}
      alt=""
      className="w-40 md:w-56 select-none"
      draggable={false}
    />
    <h3 className="mt-6 text-base font-medium text-slate-100">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);