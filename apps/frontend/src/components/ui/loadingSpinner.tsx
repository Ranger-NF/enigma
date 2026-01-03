export const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 top-1/2 h-full w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
    </div>
  );
};
