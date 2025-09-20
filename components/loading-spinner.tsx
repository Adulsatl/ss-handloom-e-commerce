interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "white" | "primary" | "gray"
}

export function LoadingSpinner({ size = "md", color = "white" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }

  const colorClasses = {
    white: "border-white border-t-transparent",
    primary: "border-yellow-500 border-t-transparent",
    gray: "border-gray-300 border-t-transparent",
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )
}
