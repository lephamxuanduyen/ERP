import React, { useEffect, useState } from 'react';
import { Field, Input, Stack, Text } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Coupon } from '../../../types/coupon.type'
import CustomInput from '../../../components/CustomInput'

interface Props {
    onSendData: (data: Coupon) => void; // Or CouponFormData
    initialData?: Partial<Coupon>; // Use Partial for initialData as some fields might be optional on create
    isEditMode?: boolean;
}

const promotionValueTypeOptions = [
    { value: 'FIX', label: 'Fixed Amount' },
    { value: 'PERCENTAGE', label: 'Percentage' }
];

export const CouponForm = ({ onSendData, initialData, isEditMode = false }: Props) => {
    const [formData, setFormData] = useState<Partial<Coupon>>({ // Use Partial<Coupon> or your CouponFormData
        code: "",
        start_date: null,
        end_date: null,
        usage_limit: 0, // Initialize with empty string for input control
        promotion_value: 0, // Initialize with empty string
        promotion_value_type: null, // Or a default like 'PERCENTAGE'
    });

    // For DatePicker: today at the beginning of the day
    const todayAtBeginning = new Date();
    todayAtBeginning.setHours(0, 0, 0, 0);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Ensure date fields are null or valid Date strings for DatePicker
                start_date: initialData.start_date ? new Date(initialData.start_date).toISOString() : null,
                end_date: initialData.end_date ? new Date(initialData.end_date).toISOString() : null,
                usage_limit: initialData.usage_limit !== null && initialData.usage_limit !== undefined ? Number(initialData.usage_limit) : 0,
                promotion_value: initialData.promotion_value !== null && initialData.promotion_value !== undefined ? Number(initialData.promotion_value) : 0,
            });
        }
    }, [initialData]);

    const handleChange = (name: keyof Coupon, value: any) => {
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };
            onSendData(updatedData as Coupon); // Cast if using Partial<Coupon>
            return updatedData;
        });
    };

    const handleDateChange = (name: 'start_date' | 'end_date', date: Date | null) => {
        handleChange(name, date ? date.toISOString() : null);
    };

    const handleSelectChange = (name: keyof Coupon, selectedOption: { value: string; label: string } | null) => {
        handleChange(name, selectedOption ? selectedOption.value : null);
    };

    return (
        <Stack> {/* Increased spacing for better readability */}
            <Field.Root orientation={'horizontal'}>
                <Field.Label minW="150px">Coupon Code:</Field.Label>
                <CustomInput
                    name='code'
                    value={formData.code || ""}
                    onChange={(e) => handleChange('code', e.target.value)}
                    maxLength={20}
                />
            </Field.Root>

            <Field.Root orientation={'horizontal'} alignItems="center">
                <Field.Label minW="150px">Start Date:</Field.Label>
                <DatePicker
                    selected={formData.start_date ? new Date(formData.start_date) : null}
                    onChange={(date) => handleDateChange('start_date', date)}
                    dateFormat="Pp" // API expects 'string($date)'
                    showTimeSelect
                    placeholderText="Select end date and time"
                    minDate={todayAtBeginning}
                    wrapperClassName="date-picker-wrapper"
                    className="chakra-input" // Apply some basic styling if needed
                />
            </Field.Root>

            <Field.Root orientation={'horizontal'} alignItems="center">
                <Field.Label minW="150px">End Date:</Field.Label>
                <DatePicker
                    selected={formData.end_date ? new Date(formData.end_date) : null}
                    onChange={(date) => handleDateChange('end_date', date)}
                    showTimeSelect
                    dateFormat="Pp" // API expects 'string($date-time)'
                    placeholderText="Select end date and time"
                    minDate={
                        formData.start_date
                            ? (new Date(formData.start_date) > todayAtBeginning ? new Date(formData.start_date) : todayAtBeginning)
                            : todayAtBeginning
                    }
                    wrapperClassName="date-picker-wrapper"
                    className="chakra-input"
                />
            </Field.Root>

            <Field.Root orientation={'horizontal'}>
                <Field.Label minW="150px">Usage Limit:</Field.Label>
                <Input
                    name='usage_limit'
                    type='number'
                    value={formData.usage_limit || ""}
                    onChange={(e) => handleChange('usage_limit', e.target.value)}
                    placeholder="e.g., 100 (optional)"
                    min="0"
                />
            </Field.Root>

            <Field.Root orientation={'horizontal'}>
                <Field.Label minW="150px">Promotion Value:</Field.Label>
                <Input
                    name='promotion_value'
                    type='number'
                    value={formData.promotion_value || ""}
                    onChange={(e) => handleChange('promotion_value', e.target.value)}
                    placeholder="e.g., 50000 or 10 (optional)"
                    min="0"
                />
            </Field.Root>

            <Field.Root orientation={'horizontal'}>
                <Field.Label minW="150px">Value Type:</Field.Label>
                <Select
                    chakraStyles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
                    name="promotion_value_type"
                    options={promotionValueTypeOptions}
                    value={promotionValueTypeOptions.find(opt => opt.value === formData.promotion_value_type) || null}
                    onChange={(option) => handleSelectChange('promotion_value_type', option as any)}
                    placeholder="Select value type (optional)"
                    isClearable
                />
            </Field.Root>
            <style>{`
                .date-picker-wrapper .chakra-input {
                    width: 100%;
                    height: var(--chakra-sizes-10); /* Chakra's default input height */
                    padding-left: var(--chakra-space-4);
                    padding-right: var(--chakra-space-4);
                    border-radius: var(--chakra-radii-md);
                    border: 1px solid var(--chakra-colors-gray-200);
                }
                .date-picker-wrapper .chakra-input:focus {
                    border-color: var(--chakra-colors-blue-500);
                    box-shadow: 0 0 0 1px var(--chakra-colors-blue-500);
                }
            `}</style>
        </Stack>
    );
};