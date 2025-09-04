import { GripVertical, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface FieldType {
    type: string;
    label: string;
}

interface FormField {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    placeholder: string;
    options: string[];
    value?: string | boolean | string[];
}

interface FieldUpdates {
    label?: string;
    placeholder?: string;
    options?: string[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: string | boolean | string[];
}

const FormBuilder: React.FC = () => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [draggedFieldType, setDraggedFieldType] = useState<FieldType | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const fieldTypes: FieldType[] = [
        { type: 'text', label: 'Text Input' },
        { type: 'textarea', label: 'Text Area' },
        { type: 'email', label: 'Email' },
        { type: 'phone', label: 'Phone' },
        { type: 'number', label: 'Number' },
        { type: 'checkbox', label: 'Checkbox' },
        { type: 'radio', label: 'Radio Button' },
        { type: 'date', label: 'Date' },
    ]

    const generateId = (): string => `field_${Date.now()}`;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, fieldType: FieldType): void => {
        setDraggedFieldType(fieldType);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDroponDocument = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        if (!draggedFieldType || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        const newField: FormField = {
            id: generateId(),
            type: draggedFieldType.type,
            label: draggedFieldType.label,
            x: x - 33,
            y: y,
            width: 150,
            height: draggedFieldType.type === 'textarea' ? 100 : 40,
            placeholder: `Enter ${draggedFieldType.label.toLowerCase()}`,
            options: draggedFieldType.type === 'radio' ? ['Option 1', 'Option 2'] : [],
            value: draggedFieldType.type === 'checkbox' ? false :
                draggedFieldType.type === 'radio' ? '' : '',
        };

        setFields(prev => [...prev, newField]);
        setSelectedField(newField.id);
        setDraggedFieldType(null);
    };

    const handleFieldClick = (fieldId: string): void => {
        setSelectedField(fieldId);
    };

    const deleteField = (fieldId: string): void => {
        setFields(prev => prev.filter(f => f.id !== fieldId));
        if (selectedField === fieldId) {
            setSelectedField(null);
        }
    };

    const updateField = (fieldId: string, updates: FieldUpdates): void => {
        setFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        ));
    };

    const handleFieldValueChange = (fieldId: string, value: string | boolean | string[]): void => {
        updateField(fieldId, { value });
    };

    const handleFieldMouseDown = (e: React.MouseEvent<HTMLDivElement>, fieldId: string): void => {
        if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'LABEL') {
            return;
        }

        e.preventDefault();
        setSelectedField(fieldId);

        const field = fields.find(f => f.id === fieldId);
        if (!field || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const startX = e.clientX - canvasRect.left - field.x;
        const startY = e.clientY - canvasRect.top - field.y;

        const handleMouseMove = (e: MouseEvent): void => {
            if (!canvasRef.current) return;
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const newX = Math.max(0, e.clientX - canvasRect.left - startX);
            const newY = Math.max(0, e.clientY - canvasRect.top - startY);
            updateField(fieldId, { x: newX, y: newY });
        };

        const handleMouseUp = (): void => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, fieldId: string): void => {
        e.preventDefault();
        e.stopPropagation();

        const field = fields.find(f => f.id === fieldId);
        if (!field) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = field.width;
        const startHeight = field.height;

        const handleMouseMove = (e: MouseEvent): void => {
            const newWidth = Math.max(100, startWidth + (e.clientX - startX));
            const newHeight = Math.max(30, startHeight + (e.clientY - startY));
            updateField(fieldId, { width: newWidth, height: newHeight });
        };

        const handleMouseUp = (): void => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const selectedFieldData = selectedField ? fields.find(f => f.id === selectedField) : null;

    const renderField = (field: FormField): React.ReactNode => {
        const baseInputClass = "w-full h-full border border-gray-300 rounded px-2 py-1 text-sm";

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        placeholder={field.placeholder}
                        className={baseInputClass}
                        value={typeof field.value === 'string' ? field.value : ''}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleFieldValueChange(field.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                );
            case 'checkbox':
                return (
                    <label className="flex items-center text-sm cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={Boolean(field.value)}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleFieldValueChange(field.id, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {field.label}
                    </label>
                );
            case 'radio':
                return (
                    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                        {field.options.map((option: string, idx: number) => (
                            <label key={idx} className="flex items-center text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name={field.id}
                                    className="mr-2"
                                    checked={field.value === option}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                            handleFieldValueChange(field.id, option);
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );
            default:
                return (
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className={baseInputClass}
                        value={typeof field.value === 'string' ? field.value : ''}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleFieldValueChange(field.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                );
        }
    };

    return (
        <div className="flex h-[100vh] bg-gray-50">
            <div className="w-64 bg-white border-r border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Field Types</h2>
                <div className="space-y-2">
                    {fieldTypes.map((fieldType) => (
                        <div
                            key={fieldType.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, fieldType)}
                            className="flex items-center p-1 bg-gray-50 border border-gray-200"
                        >
                            <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-4">
                    <h1 className="text-2xl font-bold text-gray-800">Form Builder</h1>

                </div>

                <div className="flex-1 relative overflow-auto">
                    <div
                        ref={canvasRef}
                        className="w-full h-full bg-white border border-4 m-5"

                        onDrop={handleDroponDocument}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => setSelectedField(null)}
                    >
                        {fields.map((field) => (
                            <div
                                key={field.id}
                                className={`absolute border-2 rounded-lg p-2 cursor-move ${selectedField === field.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                    }`}
                                style={{
                                    left: field.x,
                                    top: field.y,
                                    width: field.width,
                                    height: field.height,
                                }}
                                onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFieldClick(field.id);
                                }}
                            >
                                <div className="absolute -top-6 left-0 text-xs font-medium text-gray-600">
                                    {field.label}
                                </div>

                                <button
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteField(field.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>

                                <div className="w-full h-full">
                                    {renderField(field)}
                                </div>

                                <div
                                    className="resize-handle absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize z-10"
                                    onMouseDown={(e) => handleResizeMouseDown(e, field.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-80 bg-white border-l border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Properties</h2>

                {selectedFieldData ? (
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Selected Field</h3>
                            <p className="text-sm text-blue-600">ID: {selectedFieldData.id}</p>
                            <p className="text-sm text-blue-600">Type: {selectedFieldData.type}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                            <input
                                type="text"
                                value={selectedFieldData.label}
                                onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        {!['checkbox', 'radio'].includes(selectedFieldData.type) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                                <input
                                    type="text"
                                    value={selectedFieldData.placeholder}
                                    onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        )}


                        {selectedFieldData.type === 'radio' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                                <div className="space-y-2">
                                    {selectedFieldData.options.map((option, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...selectedFieldData.options];
                                                newOptions[index] = e.target.value;
                                                updateField(selectedFieldData.id, { options: newOptions });
                                            }}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        />
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newOptions = [...selectedFieldData.options, `Option ${selectedFieldData.options.length + 1}`];
                                            updateField(selectedFieldData.id, { options: newOptions });
                                        }}
                                        className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                                    >
                                        Add Option
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Field Configuration</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div><strong>Key:</strong> {selectedFieldData.id}</div>
                                <div><strong>Type:</strong> {selectedFieldData.type}</div>
                                <div><strong>Label:</strong> {selectedFieldData.label}</div>

                                <div><strong>Current Value:</strong> {
                                    selectedFieldData.value === undefined ? 'Empty' :
                                        typeof selectedFieldData.value === 'boolean' ? selectedFieldData.value.toString() :
                                            Array.isArray(selectedFieldData.value) ? selectedFieldData.value.join(', ') :
                                                selectedFieldData.value || 'Empty'
                                }</div>
                                {selectedFieldData.options.length > 0 && (
                                    <div><strong>Options:</strong> [{selectedFieldData.options.join(', ')}]</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    ""
                )}

                {/* {fields.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-medium text-gray-700 mb-2">Form Data</h3>
                        <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-auto max-h-32">
                            <pre>{JSON.stringify(fields.map(f => ({
                                id: f.id,
                                type: f.type,
                                label: f.label,
                                placeholder: f.placeholder,
                                options: f.options,
                                value: f.value
                            })), null, 2)}</pre>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default FormBuilder;