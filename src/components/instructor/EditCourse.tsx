"use client";
import React, { useState, useEffect } from 'react';
import ComponentCard from '../common/ComponentCard';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/Select';
import { ChevronDownIcon, TimeIcon } from '@/icons';
import FileInput from '../form/input/FileInput';
import TextArea from '../form/input/TextArea';
import Button from "@/components/ui/button/Button";
import { API_BASE_URL } from '../config/config';
import { useNotification } from '@/context/NotificationContext';
import { redirect } from 'next/navigation';
import Image from "next/image";
import { parse, setHours, setMinutes } from 'date-fns';
import { getLoggedInUser } from "@/helpers/authHelper";
import { InputMask } from '@react-input/mask';
import DatePicker from '@/components/form/date-picker';

type EditFormProps = {
    id: string | number;
};
export default function EditCourseForm({ id }: EditFormProps) {
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
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [operatingSystemOtions, setOperatingSystemOptions] = useState<{ value: string; label: string }[]>([]);
    const [operatingSystemImageOptions, setOperatingSystemImageOptions] = useState([{ value: 'new', label: 'New' }]);
    const [publishCourseOptions, setPublishCourseOptions] = useState([{ label: 'Publish', value: 'pending' }]);
    const [preview, setPreview] = useState<string>("");
    const [universityPreview, setUniversityPreview] = useState<string>("");
    const [durationDate, setDurationDate] = useState<Date | null>(null);
    const [courseApproved, setCourseApproved] = useState('Pending');
    const [coursePublished, setCoursePublished] = useState('Pending');
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    useEffect(() => {
        const fetchOperatingSystems = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/operating-systems`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setOperatingSystemOptions(data.data);
            } catch (error) {
                console.error("Error fetching operating systems:", error);
                showNotification(
                    '',
                    'Failed to fetch operating systems',
                    'error'
                );
            }
        }
        fetchOperatingSystems();
        topicTeach();
        if (id) fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const { token, IdToken, AccessToken } = getLoggedInUser();
            if (!token || !IdToken || !AccessToken) {
                showNotification(
                    'Error.',
                    'Unauthorized action',
                    'error'
                );
                throw new Error("Unauthorized action");
            }
            const response = await fetch(`${API_BASE_URL}/api/v1/instructor/courses/edit-course/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-ID-TOKEN": IdToken || "",
                    "X-ACCESS-TOKEN": AccessToken || "",
                },
            });
            const data = await response.json();
            if (!response.ok) {
                showNotification(
                    'Error.',
                    'Failed to fetch course data',
                    'error'
                );
                redirect("/instructor/courses");
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
                setPreview(course.courseImage);
                setUniversityPreview(course.universityImage ?? "");
                setFormData(updatedData);
                setCourseApproved(course.isApproved);
                setCoursePublished(course.published);
                if (course.published === "rejected") {
                    setPublishCourseOptions(prev => [
                        ...prev,
                        { label: 'Rejected', value: 'rejected' }
                    ]);
                }
                if (formData.courseDuration) {
                    const [hours, minutes] = formData.courseDuration.split(':');
                    const now = new Date();
                    const updated = setHours(setMinutes(now, parseInt(minutes)), parseInt(hours));
                    setDurationDate(updated);
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }
    const handleSelectChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type } = e.target;
        if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
            const newFile = e.target.files[0];
            if (newFile) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(newFile.type)) {
                    if (name == 'universityImage') {
                        setErrors(prev => ({
                            ...prev,
                            universityImage: "Only JPG, JPEG, or PNG files are allowed.",
                        }));
                    } else {
                        setErrors(prev => ({
                            ...prev,
                            profilePic: "Only JPG, JPEG, or PNG files are allowed.",
                        }));
                    }
                    const inputElement = e.target;
                    inputElement.value = '';
                    return;
                }
                const formdata = new FormData();
                formdata.append("file", newFile);
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/v1/instructor/upload-s3`, {
                    method: 'POST',
                    body: formdata,
                });
                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }
                const data = await response.json();
                const { url } = data.data;
                if (name == 'universityImage') {
                    setFormData(prevState => ({
                        ...prevState,
                        universityImage: url
                    }));
                    setUniversityPreview(url);
                } else {
                    setFormData(prevState => ({
                        ...prevState,
                        courseImage: url
                    }));
                    setPreview(url);
                }
                const inputElement = e.target;
                inputElement.value = '';
                setLoading(false);
            } else {
                if (name == 'universityImage') {
                    setUniversityPreview("");
                    setFormData(prev => ({
                        ...prev,
                        universityImage: ""
                    }));
                } else {
                    setPreview("");
                    setFormData(prevState => ({
                        ...prevState,
                        universityImage: ""
                    }));
                }

            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        try {
            const { token, IdToken, AccessToken } = getLoggedInUser();
            const response = await fetch(`${API_BASE_URL}/api/v1/instructor/courses/update-course/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-ID-TOKEN": IdToken || "",
                    "X-ACCESS-TOKEN": AccessToken || "",
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
                return redirect('/instructor/courses');
            }, 5000);
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
    const topicTeach = async () => {
        try {
            const { token, IdToken, AccessToken } = getLoggedInUser();
            const response = await fetch(`${API_BASE_URL}/api/v1/instructor/topic-teach`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-ID-TOKEN": IdToken || "",
                    "X-ACCESS-TOKEN": AccessToken || "",
                },
            });
            const data = await response.json();
            const getCourses = data?.data?.courses ?? '';
            const coursesArray = getCourses
                .split(/[\s,]+/)
                .map((course: any) => course.trim())
                .filter((course: any) => course.length > 0);
            const formattedOptions = coursesArray.map((course: any) => ({
                value: course,
                label: course,
            }));
            setOptions(formattedOptions);
        } catch (error) {
            console.log(error);
        }
    }
    const handleRemovePreview = () => {
        setPreview("");
        setFormData(prev => ({
            ...prev,
            courseImage: ""
        }));
    }
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            courseDuration: e.target.value,
        }));
    };
    const handleUniversityPreview = () => {
        setUniversityPreview("");
        setFormData(prev => ({
            ...prev,
            universityImage: ""
        }));
    }

    const handleChangeOperatingSystem = async (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        try {
            setLoading(true);
            const { token, IdToken, AccessToken } = getLoggedInUser();
            const response = await fetch(`${API_BASE_URL}/api/v1/instructor/operating-system-image?os=${value}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-ID-TOKEN": IdToken || "",
                    "X-ACCESS-TOKEN": AccessToken || "",
                },
            });
            const data = await response.json();
            const getOperatingSystemImage = data?.data || [];
            const formattedOptions = getOperatingSystemImage.map((os: any) => ({
                value: os.id,
                label: os.image_id,
            }));
            formattedOptions.push({ value: 'new', label: 'New' });
            setOperatingSystemImageOptions(formattedOptions);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

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
                            <div className="relative">
                                <Select
                                    name="courseCategory"
                                    options={options}
                                    placeholder="Select an option"
                                    onChange={handleSelectChange}
                                    className="dark:bg-dark-900"
                                    defaultValue={formData.courseCategory}
                                />
                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                    <ChevronDownIcon />
                                </span>
                            </div>
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
                            <Label>Course Thumbnail Image Upload</Label>
                            <FileInput onChange={handleFileChange} name='courseImage' className="custom-class" />
                            {preview != "" && (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    <div className="mt-4 relative">
                                        <Image
                                            src={preview}
                                            alt=" grid"
                                            className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
                                            width={50}
                                            height={0}
                                            unoptimized={true}
                                        />
                                        <button className="absolute -top-2 -right-2 rounded-full overflow-hidden" onClick={handleRemovePreview}>
                                            <Image src='/web/images/cross-icon.png' alt="" width={20} height={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {errors?.courseImage && (
                                <span className="text-red-500 text-sm">{errors.courseImage}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>Operating System</Label>
                            <div className="relative">
                                <Select
                                    name="operatingSystem"
                                    options={operatingSystemOtions}
                                    placeholder="Select an option"
                                    onChange={handleChangeOperatingSystem}
                                    className="dark:bg-dark-900"
                                    defaultValue={formData.operatingSystem}
                                />
                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                    <ChevronDownIcon />
                                </span>
                            </div>
                            {errors?.operatingSystem && (
                                <span className="text-red-500 text-sm">{errors.operatingSystem}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>Operating System Image</Label>
                            <div className="relative">
                                <Select
                                    name="operatingSystemImage"
                                    options={operatingSystemImageOptions}
                                    placeholder="Select an option"
                                    onChange={handleSelectChange}
                                    className="dark:bg-dark-900"
                                    defaultValue={formData.operatingSystemImage}
                                />
                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                    <ChevronDownIcon />
                                </span>
                            </div>
                            {errors?.operatingSystemImage && (
                                <span className="text-red-500 text-sm">{errors.operatingSystemImage}</span>
                            )}
                        </div>
                        <div className="form-field">
                            <Label>University Logo</Label>
                            <FileInput onChange={handleFileChange} name='universityImage' className="custom-class" />
                            {universityPreview != "" && (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    <div className="mt-4 relative">
                                        <Image
                                            src={universityPreview}
                                            alt=" grid"
                                            className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
                                            width={50}
                                            height={0}
                                            unoptimized={true}
                                        />
                                        <button className="absolute -top-2 -right-2 rounded-full overflow-hidden" onClick={handleUniversityPreview}>
                                            <Image src='/web/images/cross-icon.png' alt="" width={20} height={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {errors?.universityImage && (
                                <span className="text-red-500 text-sm">{errors.universityImage}</span>
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
                        {
                            courseApproved === "rejected" ? (
                                <div className="form-field">
                                    <Label>Course Approval</Label>
                                    <div className="relative">
                                        <Select
                                            name="isApproved"
                                            options={[
                                                { label: 'Send for Approval', value: 'pending' },
                                                { label: 'Rejected', value: 'rejected' },
                                            ]}
                                            placeholder="Select an option"
                                            onChange={handleSelectChange}
                                            className="dark:bg-dark-900"
                                            defaultValue={formData.isApproved}
                                        />
                                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                            <ChevronDownIcon />
                                        </span>
                                    </div>
                                    {errors?.isApproved && (
                                        <span className="text-red-500 text-sm">{errors.isApproved}</span>
                                    )}
                                </div>
                            ) : ''
                        }
                        {
                            courseApproved === "completed" && (!coursePublished || coursePublished === "" || coursePublished === "rejected") ? (
                                <div className="form-field">
                                    <Label>Publish Course</Label>
                                    <div className="relative">
                                        <Select
                                            name="published"
                                            options={publishCourseOptions}
                                            placeholder="Select an option"
                                            onChange={handleSelectChange}
                                            className="dark:bg-dark-900"
                                            defaultValue={formData.published}
                                        />
                                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                            <ChevronDownIcon />
                                        </span>
                                    </div>
                                    {errors?.published && (
                                        <span className="text-red-500 text-sm">{errors.published}</span>
                                    )}
                                </div>
                            ) : ''
                        }

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
