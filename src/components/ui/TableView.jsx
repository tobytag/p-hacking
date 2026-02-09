import { useState } from 'react';
import { Plus, FileDown, MoreVertical, Trash2 } from 'lucide-react';
import Card from './Card';
import RowActions from './RowActions';

export default function TableView({
    title, columns, data, emptyMessage, description,
    onAdd, onEdit, onDelete, onView, onDownload,
    enableMultiSelect = false, onBulkDelete
}) {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(new Set(data.map(row => row.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (rowId, e) => {
        e.stopPropagation();
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowId)) {
            newSelected.delete(rowId);
        } else {
            newSelected.add(rowId);
        }
        setSelectedRows(newSelected);
    };

    const handleBulkDelete = () => {
        if (selectedRows.size > 0 && onBulkDelete) {
            onBulkDelete(Array.from(selectedRows));
            setSelectedRows(new Set());
            setShowActionsMenu(false);
        }
    };

    const allSelected = data.length > 0 && selectedRows.size === data.length;
    const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

    return (
        <Card className="flex flex-col h-[calc(100vh-12rem)]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <h3 className="font-semibold text-slate-800">{title}</h3>
                        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                            {data.length}
                        </span>

                        {/* Hamburger Menu for Actions */}
                        {enableMultiSelect && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                                >
                                    <MoreVertical className="w-3 h-3" />
                                    <span>Actions</span>
                                </button>

                                {showActionsMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20">
                                        <div className="py-1">
                                            {onDownload && (
                                                <button
                                                    onClick={() => {
                                                        onDownload();
                                                        setShowActionsMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                                >
                                                    <FileDown className="w-4 h-4" />
                                                    <span>Download CSV</span>
                                                </button>
                                            )}
                                            {selectedRows.size > 0 && onBulkDelete && (
                                                <button
                                                    onClick={handleBulkDelete}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete Selected ({selectedRows.size})</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Legacy download button for non-multi-select tables */}
                        {!enableMultiSelect && onDownload && (
                            <button
                                onClick={onDownload}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                            >
                                <FileDown className="w-3 h-3" />
                                <span>Download</span>
                            </button>
                        )}

                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Add New</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Selection Bar */}
            {enableMultiSelect && selectedRows.size > 0 && (
                <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                    <span className="text-sm text-blue-700 font-medium">
                        {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        onClick={() => setSelectedRows(new Set())}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-auto pb-24">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {enableMultiSelect && (
                                <th className="px-6 py-3 w-12">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={input => {
                                            if (input) input.indeterminate = someSelected;
                                        }}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-3 font-medium tracking-wider whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                            <th className="px-6 py-3 font-medium tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row, idx) => {
                                const isSelected = selectedRows.has(row.id);
                                return (
                                    <tr
                                        key={row._rowKey || row.id || idx}
                                        className={`transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                                            }`}
                                        onClick={() => onView && onView(row)}
                                    >
                                        {enableMultiSelect && (
                                            <td className="px-6 py-3 w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectRow(row.id, e)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx} className="px-6 py-3 whitespace-nowrap text-slate-700 max-w-xs">
                                                <div className="truncate">
                                                    {col.render ? col.render(row) : (row[col.accessor] === null || row[col.accessor] === undefined ? <span className="text-slate-300">-</span> : row[col.accessor].toString())}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-6 py-3 whitespace-nowrap text-right">
                                            <RowActions
                                                onView={() => onView && onView(row)}
                                                onEdit={() => onEdit && onEdit(row)}
                                                onDelete={() => onDelete && onDelete(row)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (enableMultiSelect ? 2 : 1)} className="px-6 py-12 text-center text-slate-400">
                                    {emptyMessage || "No data available"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
