import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';

export default function RowActions({ onEdit, onDelete, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 z-50 overflow-hidden py-1">
                    {onView && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onView(); }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center"
                        >
                            <Eye className="w-3 h-3 mr-2" />
                            View Details
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center"
                        >
                            <Edit2 className="w-3 h-3 mr-2" />
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center"
                        >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
