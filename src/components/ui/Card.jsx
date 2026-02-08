export default function Card({ children, className = '' }) {
    return (
        <div className={`bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}
