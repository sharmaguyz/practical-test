"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import ComponentCard from "@/components/common/ComponentCard";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { redirect } from "next/navigation";
import { useNotification } from '@/context/NotificationContext';
import Image from "next/image";
const InstructorForm = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const isEdit = userId !== "add";
    const title = isEdit ? "" : "Add Instructor";
    const [formData, setFormData] = useState<{
        fullName: string;
        email: string;
        phoneNumber: string;
        profilePic: string;
        jobTitle: string;
        organization: string;
        bio: string;
        expectedStudents: string;
        topicTeach: string;
        rolename: string
    }>({
        fullName: '',
        email: '',
        phoneNumber: '',
        profilePic: '',
        jobTitle: '',
        organization: '',
        bio: '',
        expectedStudents: '',
        topicTeach: '',
        rolename: 'INSTRUCTOR'
    });
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        setUserId(id);
    }, []);
    useEffect(() => {
        const errorElement = document.querySelector(".text-red-500.text-sm");
        if (errorElement) {
            const inputField = errorElement.previousElementSibling;
            if (inputField && inputField instanceof HTMLElement) {
                inputField.focus();
                inputField.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [errors]);
    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    showNotification(
                        'Error.', 
                        'Unauthorized action', 
                        'error'
                    );
                    throw new Error("Unauthorized action");
                }
                const response = await fetch(`${API_BASE_URL}/api/v1/admin/edit-user?userId=${userId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const result = await response.json();
                if (!response.ok) {
                    showNotification(
                        'Error.', 
                        'Failed to submit user data', 
                        'error'
                    );
                    throw new Error(result.message || "Failed to submit user data");
                }
                if (result.success && result.data) {
                    const { user, metaData } = result.data;
                    setFormData({
                        fullName: user.fullName || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || '',
                        profilePic: metaData.profilePic,
                        jobTitle: metaData.jobTitle || '',
                        organization: metaData.organization || '',
                        bio: metaData.bio || '',
                        expectedStudents: metaData.expectedStudents || '',
                        topicTeach: metaData.topicTeach || '',
                        rolename: 'INSTRUCTOR',
                    });
                    setPreview(metaData?.profilePic);
                }
            } catch (error) {
                console.error("Error fetching status change:", error);
            }
        };
        fetchData();
    }, [userId]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target;
        if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
            const newFile = e.target.files[0];
            if (newFile) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(newFile.type)) {
                    setErrors(prev => ({
                        ...prev,
                        profilePic: "Only JPG, JPEG, or PNG files are allowed.",
                    }));
                    return;
                }
                console.log("name : ",name);
                const formdata = new FormData();
                formdata.append("file", newFile);
                const response = await fetch(`${API_BASE_URL}/api/v1/instructor/upload-s3`, {
                    method: 'POST',
                    body: formdata,
                });
                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }
                const data = await response.json();
                const { url } = data.data;
                setFormData(prevState => ({
                    ...prevState,
                    profilePic: url
                }));
                setPreview(url);
                const inputElement = e.target;
                inputElement.value = '';
            }else{
                setPreview("");
                setFormData(prev => ({
                    ...prev,
                    [name]: ""
                }));
            }
        } else {
            const value = e.target.value;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setErrorMessage("");
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Unauthorized action");
            }
            let url = '';
            let method = '';
            let payload = {
              ...formData,
              ...(userId ? { userId } : {}), // Conditionally add userId if updating
            };
            if (!userId) {
              url = `${API_BASE_URL}/api/v1/admin/store-user`;
              method = "POST";
            } else {
              url = `${API_BASE_URL}/api/v1/admin/update-user`;
              method = "PUT";
            }
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // <- Add this line
                },
                body: JSON.stringify(payload),
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
                showNotification(
                    'Error.', 
                    'Failed to submit instructor data', 
                    'error'
                );
            }
            const message = userId != null ? "Instructor profile updated successfully" : "Instructor profile created successfully";
            showNotification(
                'Success.', 
                message, 
                'success'
            );
            (e.target as HTMLFormElement).reset();
            setTimeout(() => {
                redirect("/admin/instructors");
            }, 1000);
        } catch (err) {
            showNotification(
                'Error.', 
                'Something went wrong', 
                'error'
            );
        } finally {
            setLoading(false);
        }
    }
    const handleRemovePreview = () => {
        setPreview("");
        setFormData(prev => ({
            ...prev,
            profilePic: ""
        }));
    }
    return (
        <>
        <form onSubmit={handleSubmit}>
            <ComponentCard title={title} is_show_button={true} button_text="Back" button_link="/admin/instructors">
                <div className="space-y-6">
                    <div>
                        <Label>Full Name<span className="text-red-500">*</span></Label>
                        <Input onChange={handleChange} defaultValue={formData.fullName} name="fullName" type="text" placeholder="" />
                        {errors?.fullName && (
                            <span className="text-red-500 text-sm">{errors.fullName}</span>
                        )}
                    </div>
                    <div>
                        <Label>Email Address<span className="text-red-500">*</span></Label>
                        <Input onChange={handleChange} defaultValue={formData.email} name="email" type="text" placeholder="" />
                        {errors?.email && (
                            <span className="text-red-500 text-sm">{errors.email}</span>
                        )}
                    </div>
                    <div>
                        <Label>Phone Number</Label>
                        <Input onChange={handleChange} defaultValue={formData.phoneNumber} name="phoneNumber" type="text" placeholder="" />
                        {errors?.phoneNumber && (
                            <span className="text-red-500 text-sm">{errors.phoneNumber}</span>
                        )}
                    </div>
                    <div>
                        <Label>Upload Profile</Label>
                        <FileInput name="profilePic" onChange={handleChange} className="custom-class" />
                        {errors?.profilePic && (
                            <span className="text-red-500 text-sm">{errors.profilePic}</span>
                        )}
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
                                        <Image src='/web/images/cross-icon.png' alt="" width={20} height={20}/>
                                    </button>
                              </div>
                          </div>
                        )}
                      
                    </div>
                    <div>
                        <Label>Job Title / Position<span className="text-red-500">*</span></Label>
                        <Input onChange={handleChange} defaultValue={formData.jobTitle} name="jobTitle" type="text" placeholder="" />
                        {errors?.jobTitle && (
                            <span className="text-red-500 text-sm">{errors.jobTitle}</span>
                        )}
                    </div>
                    <div>
                        <Label>Institution/Organization</Label>
                        <Input onChange={handleChange} defaultValue={formData.organization} name="organization" type="text" placeholder="" />
                        {errors?.organization && (
                            <span className="text-red-500 text-sm">{errors.organization}</span>
                        )}
                    </div>
                    <div>
                        <Label>Short Bio</Label>
                        <textarea
                            rows={6}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden"
                            name="bio"
                            value={formData.bio}
                        />
                        {errors?.bio && (
                            <span className="text-red-500 text-sm">{errors.bio}</span>
                        )}
                    </div>
                    <div>
                        <Label>Expected Number of Students Per Year<span className="text-red-500">*</span></Label>
                        <Input onChange={handleChange} defaultValue={formData.expectedStudents} name="expectedStudents" type="text" placeholder="" />
                        {errors?.expectedStudents && (
                            <span className="text-red-500 text-sm">{errors.expectedStudents}</span>
                        )}
                    </div>
                    <div>
                        <Label>Topics You Want to Teach<span className="text-red-500">*</span></Label>
                        <Input onChange={handleChange} defaultValue={formData.topicTeach} name="topicTeach" type="text" placeholder="" />
                        {errors?.topicTeach && (
                            <span className="text-red-500 text-sm">{errors.topicTeach}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-5">
                        <Button size="sm" disabled={loading} variant="primary" endIcon={""}>
                            {loading ? "Please wait" : "Submit"}
                        </Button>
                    </div>
                </div>
            </ComponentCard>
        </form>
        </>
       
    )
}

export default InstructorForm