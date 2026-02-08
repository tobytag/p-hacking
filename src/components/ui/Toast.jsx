import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({
    id,
    message,
    variant = 'info',
    duration = 5000,
    onClose
}) => {
    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    const variants = {
        success: {
            bg: 'bg-green-50 border-green-200',
            icon: <CheckCircle className="w-5 h-5 text-green-600" />,
            text: 'text-green-800'
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            icon: <XCircle className="w-5 h-5 text-red-600" />,
            text: 'text-red-800'
        },
        warning: {
            bg: 'bg-yellow-50 border-yellow-200',
            icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
            text: 'text-yellow-800'
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            icon: <Info className="w-5 h-5 text-blue-600" />,
            text: 'text-blue-800'
        }
    };

    const config = variants[variant] || variants.info;

    return (
        <div
            className={`${config.bg} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md flex items-start gap-3 animate-slide-in`}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                {config.icon}
            </div>
            <div className={`flex-1 ${config.text} text-sm leading-relaxed`}>
                {message}
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
