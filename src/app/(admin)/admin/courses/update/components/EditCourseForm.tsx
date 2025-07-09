"use client";
import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { ChevronDownIcon, TimeIcon } from '@/icons';
import FileInput from '@/components/form/input/FileInput';
import TextArea from '@/components/form/input/TextArea';
import Button from "@/components/ui/button/Button";
import { API_BASE_URL } from '@/components/config/config';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { parse, setHours, setMinutes } from 'date-fns';
import { InputMask } from '@react-input/mask';
import DatePicker from '@/components/form/date-picker';

type EditFormProps = {
    id: string | number;
};
export default function EditCourseForm({ id }: EditFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        courseId: '',
        courseName: '',
        price: '',
        courseCategory: '',
        operatingSystem: '',
        operatingSystemImage: '',
        courseDuration: null as string | null,
        courseImage: '',
        status: 'active',
        isApproved: 'pending',
        published: '',
        description: '',
        universityImage: '',
        start_date: '',
        end_date: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const { showNotification } = useNotification();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    useEffect(() => {
        if (id) fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/course/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                showNotification(
                    'Error.',
                    'Failed to fetch course data',
                    'error'
                );
                router.push("/admin/courses");
            }
            if (response.status == 200 && data?.success && data?.data) {
                const course = data.data.course.response;
                const updatedData = {
                    courseId: String(id || ''),
                    courseName: course.courseName || '',
                    price: course.price || '',
                    courseCategory: course.courseCategory || '',
                    operatingSystem: course.operatingSystem || '',
                    courseDuration: course.courseDuration || '',
                    courseImage: course.courseImage || '',
                    status: course.status || 'active',
                    isApproved: course.isApproved || 'pending',
                    published: course.published || '',
                    description: course.description || '',
                    operatingSystemImage: course.operatingSystemImage || '',
                    universityImage: course.universityImage || '',
                    start_date: course.start_date || '',
                    end_date: course.end_date || '',
                };
                setFormData(updatedData);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/courses/update-course/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.status === 422) {
                const formattedErrors = (data.errors as Array<Record<string, string>>).reduce(
                    (acc: Record<string, string>, error) => {
                        const key = Object.keys(error)[0];
                        acc[key] = error[key];
                        return acc;
                    },
                    {} as Record<string, string>
                );
                setErrors(formattedErrors);
                return;
            }
            if (!response.ok) {
                throw new Error(data.message || "Password Changed Failed!");
            }
            showNotification(
                '',
                `Your course has been updated successfully!`,
                'success'
            );
            (e.target as HTMLFormElement).reset();
            setTimeout(() => {
                router.push("/admin/courses");
            }, 3000);
        } catch (err) {
            const error = err instanceof Error ? err.message : "Something went wrong";
            showNotification(
                '',
                error,
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            courseDuration: e.target.value,
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <ComponentCard title="Edit Course Form">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="form-field">
                            <Label>Course Name</Label>
                            <TextArea
                                name="courseName"
                                placeholder="Provide a name of the course."
                                value={formData.courseName}
                                onChange={(value) =>
                                    handleInputChange({ target: { name: "courseName", value } } as React.ChangeEvent<HTMLInputElement>)
                                }
                                rows={6}
                            />
                            {errors?.courseName && (
                                <span className="text-red-500 text-sm">{errors.courseName}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>Course Price (in $)</Label>
                            <Input
                                name='price'
                                type="text"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder='Course Price (in $)'
                            />
                            {errors?.price && (
                                <span className="text-red-500 text-sm">{errors.price}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>Course Category</Label>
                            <Input
                                name='courseCategory'
                                type="text"
                                value={formData.courseCategory}
                                onChange={handleInputChange}
                                placeholder='Course Category'
                                disabled={true}
                            />
                            {errors?.courseCategory && (
                                <span className="text-red-500 text-sm">{errors.courseCategory}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label htmlFor="tm">Course Duration</Label>
                            <div className="">
                                <InputMask
                                    mask="99:99"
                                    replacement={{ '9': /\d/ }}
                                    placeholder='Hours:Minutes'
                                    onChange={handleTimeChange}
                                    value={formData.courseDuration || ''}
                                    className='h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800  border-gray-300 dark:border-gray-700'
                                />
                                {errors?.courseDuration && (
                                    <span className="text-red-500 text-sm">{errors.courseDuration}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-field">
                            <Label>Operating System</Label>
                            <Input
                                name='operatingSystem'
                                type="text"
                                value={formData.operatingSystem}
                                onChange={handleInputChange}
                                placeholder='Operating System'
                                disabled={true}
                            />
                            {errors?.operatingSystem && (
                                <span className="text-red-500 text-sm">{errors.operatingSystem}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>Operating System Image</Label>
                            <Input
                                name="operatingSystemImage"
                                type="text"
                                placeholder="Operating System Image"
                                value={formData.operatingSystemImage}
                                disabled={true}
                            />
                            {errors?.operatingSystemImage && (
                                <span className="text-red-500 text-sm">{errors.operatingSystemImage}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>Start Date</Label>
                            <DatePicker
                                id="date-picker-start"
                                label=""
                                name='start_date'
                                placeholder="Select start date"
                                minDate={new Date()}
                                onChange={(date) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        start_date: date ? date[0].toString() : ''
                                    }));
                                }}
                                defaultValue={formData.start_date}
                            />
                            {errors?.start_date && (
                                <span className="text-red-500 text-sm">{errors.start_date}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>End Date</Label>
                            <DatePicker
                                id="date-picker-end"
                                label=""
                                name='end_date'
                                placeholder="Select end date"
                                minDate={new Date()}
                                onChange={(date) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        end_date: date ? date[0].toString() : ''
                                    }));
                                }}
                                defaultValue={formData.end_date}
                            />
                            {errors?.end_date && (
                                <span className="text-red-500 text-sm">{errors.end_date}</span>
                            )}
                        </div>

                        <div className="form-field">
                            <Label>Course Description</Label>
                            <TextArea
                                name="description"
                                value={formData.description}
                                onChange={(value) =>
                                    handleInputChange({ target: { name: "description", value } } as React.ChangeEvent<HTMLInputElement>)
                                }
                                rows={6}
                                placeholder="Provide a brief description of the course."
                            />
                            {errors?.description && (
                                <span className="text-red-500 text-sm">{errors.description}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-5 justify-end mt-6">
                    <Button size="sm" disabled={loading} variant="primary" className="px-8">{loading ? "Please wait" : "Submit"}</Button>
                </div>
            </ComponentCard>
        </form>
    );
}
