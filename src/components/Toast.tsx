interface ToastProps {
    message: string;
    variant?: "error" | "success";
}

export default function Toast({ message, variant = "error" }: ToastProps) {
    const isError = variant === "error";
    return (
        <div
            className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 sm:max-w-sm rounded-xl bg-surface border px-4 py-3 text-sm shadow-2xl transition-all duration-200 ${isError ? "border-red-500/30 text-red-400" : "border-teal-500/30 text-teal-300"
                }`}
            role="status"
        >
            {message}
        </div>
    );
}
