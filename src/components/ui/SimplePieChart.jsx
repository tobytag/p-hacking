export default function SimplePieChart({ data }) {
    // data: [{ label, value, color }]
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const segments = data.map((item, i) => {
        const percentage = item.value / total;
        const angle = percentage * 360;
        const style = {
            background: `conic-gradient(${item.color} 0deg ${angle}deg, transparent ${angle}deg 360deg)`,
            transform: `rotate(${currentAngle}deg)`,
            zIndex: data.length - i
        };
        currentAngle += angle;
        return (
            <div
                key={i}
                className="absolute inset-0 rounded-full"
                style={style}
            />
        );
    });

    return (
        <div className="relative w-48 h-48 mx-auto">
            {segments}
            <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner">
                <div className="text-center">
                    <span className="block text-2xl font-bold text-slate-800">{total}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Studies</span>
                </div>
            </div>
        </div>
    );
}
