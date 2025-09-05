import React, { useState } from 'react';

interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder: string;
    options: string[];
    required?: boolean;
}

interface FormData {
    [fieldId: string]: string | boolean | string[];
}

const ViewForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({});
    const storedFields = JSON.parse(localStorage.getItem('fieldsData') || '[]');


    const handleInputChange = (fieldId: string, value: string | boolean | string[]): void => {

        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        const submitData = {
            data: formData,
        }
        localStorage.setItem('submitedForm', JSON.stringify(submitData));
        alert('Form submitted successfully!');
    };

    const renderField = (field: FormField): React.ReactNode => {
        const baseInputClass = "w-1/2 p-3 border border-gray-300 rounded-md ";

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'number':
            case 'date':
                return (
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={baseInputClass}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        placeholder={field.placeholder}
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={baseInputClass}
                        rows={4}
                    />
                );

            case 'checkbox':
                return (
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={Boolean(formData[field.id])}
                            onChange={(e) => handleInputChange(field.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{field.label}</span>
                    </label>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options.map((option: string, idx: number) => (
                            <label key={idx} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={option}
                                    checked={formData[field.id] === option}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    required={field.required}
                                />
                                <span className="text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            default:
                return (
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={baseInputClass}
                        required={field.required}
                    />
                );
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Form</h1>
                    <p className="text-gray-600">Please fill out the following details</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {storedFields.map((field: FormField) => (
                        <div key={field.id} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                            </label>
                            {renderField(field)}
                        </div>
                    ))}

                    <div className="flex justify-between items-center pt-6">
                        <button
                            type="button"
                            onClick={() => history.back()}
                            className="text-gray-600 hover:text-gray-800 underline"
                        >
                            ← Back to Builder
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 font-medium"
                        >
                            Submit Form
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ViewForm;