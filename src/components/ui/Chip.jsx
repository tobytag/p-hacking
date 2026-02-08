export default function Chip({ children, color = "bg-slate-100 text-slate-600", className = "" }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 mb-1 border border-transparent ${color} ${className}`}>
            {children}
        </span>
    );
}
