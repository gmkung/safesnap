
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-circuit-flow h-12 w-12 rounded-full border-2 border-space relative">
        <div className="absolute inset-0 rounded-full shadow-steel"></div>
      </div>
    </div>
  );
}
