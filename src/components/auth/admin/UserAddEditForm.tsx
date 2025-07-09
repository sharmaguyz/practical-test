
"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { use } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@/icons";
import Checkbox from "@/components/form/input/Checkbox";
import Radio from "@/components/form/input/Radio";
import Button from "@/components/ui/button/Button";
import { fetchData } from "@/helpers/apiHelper";
import { API_BASE_URL } from "@/components/config/config";
import { useNotification } from '@/context/NotificationContext';
import { redirect } from "next/navigation";
type StateType = {
    name: string;
    isoCode: string;
    countryCode: string;
};

type CountryType = {
    name: string;
    isoCode: string;
    flag?: string;
    phonecode?: string;
};
type DropdownOptionsType = {
    id: number;
    name: string;
};
type AddEditFormProps = {
    id: string | number;
};
export default function UserAddEditForm({ id }: AddEditFormProps) {
    const { showNotification } = useNotification()
    const [error, setError] = useState('');
    const [countries, setCountries] = useState<CountryType[]>([]);
    const [highestDegreeObtianedDetails, setHighestDegreeObtianedDetails] = useState<DropdownOptionsType[]>([]);
    const [currentlyEnrolledDegree, setCurrentlyEnrolledDegree] = useState<DropdownOptionsType[]>([]);
    const [certification, setCertification] = useState<DropdownOptionsType[]>([]);
    const [preferredWorkType, setPreferredWorkType] = useState<DropdownOptionsType[]>([]);
    const [securityClearanceLevel, setsecurityClearanceLevel] = useState<DropdownOptionsType[]>([]);
    const [technicalSkill, setTechnicalSkill] = useState<DropdownOptionsType[]>([]);
    const [workAuthorization, setWorkAuthorization] = useState<DropdownOptionsType[]>([]);
    const [states, setStates] = useState<StateType[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [stateError, setStateError] = useState("");
    const [showOtherCertification, setShowOtherCertification] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    // const [errors, setErrors] = useState<FormErrors>({});
    const userId = typeof id === "string" ? id : id.toString();
    const isEdit = userId !== "add";
    const title = isEdit ? "Edit Student" : "Add Student";
    const normalizeBoolean = (value: string | boolean): boolean => {
        return value === true || value === "true";
    }

    const isTrue = (val: string | boolean): boolean => val === true || val === "true";
    const isFalse = (val: string | boolean): boolean => val === false || val === "false";
    const initialFormData = {
        fullName: '',
        email: '',
        // password: '',
        // confirmPassword: '',
        phoneNumber: '',
        country: '',
        state: '',
        city: '',
        linkedin: '',
        portfolio: '',
        highestDegree: '',
        currentlyEnrolled: '',
        university: '',
        graduationDate: "",
        yearsOfExperience: '',
        certifications: [] as number[],
        otherCertification: '',
        securityClearance: '',
        workAuthorization: '',
        workType: [] as number[],
        activelySeeking: normalizeBoolean("false"),
        profileVisible: normalizeBoolean("false"),
        technicalSkills: [] as number[],
        rolename: "STUDENT",
    }
    const [formData, setFormData] = useState(initialFormData);
    useEffect(() => {
        const errorElement = document.querySelector(".text-red-500.text-xs.mt-1");
        if (errorElement) {
            const inputField = errorElement.previousElementSibling;
            if (inputField && inputField instanceof HTMLElement) {
                inputField.focus();
                inputField.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [errors]);
    useEffect(() => {
        if (isEdit) {
            const fetchUserData = async () => {
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
                    const response = await fetch(`${API_BASE_URL}/api/v1/admin/get-user-metadata?userId=${userId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    // console.log("data :", data)
                    if (!response.ok) {
                        showNotification(
                            'Error.',
                            'Failed to fetch user data',
                            'error'
                        );
                        console.log("Error :", data?.message)
                        redirect("/admin/users");
                        throw new Error(data.message || "Failed to fetch user data");
                    }
                    if (data?.success && data?.data) {
                        const updatedData = {
                            ...initialFormData,
                            ...(data.data?.user || {}),
                            ...(data.data?.metaData || {}),
                            ...userId && { userId }, // Add userId to the form data if it exists
                        }
                        setFormData(updatedData);
                        if (data.data?.metaData?.country) {
                            handleCountryChange(data.data.metaData.country);
                        }
                    }
                } catch (err) {
                    console.error("Fetch error:", err);
                }
            };
            fetchUserData();
        }
    }, [isEdit, userId]); // Add userId to the dependency array

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Unauthorized action");
            }
            let url = '';
            let method = '';
            if (!isEdit) {
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
                body: JSON.stringify(formData),
            });
            // console.log("response :", response)
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
                    'Failed to submit user data',
                    'error'
                );
                throw new Error(data.message || "Failed to submit user data");
            }

            (e.target as HTMLFormElement).reset();
            const message = userId != "add" ? "User profile updated successfully" : "User profile created successfully";
            showNotification(
                '',
                message,
                'success'
            );
            setTimeout(() => {
                redirect("/admin/users");
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
    };
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [countriesRes, highestDegreeObtianedRes, currentlyEnrolledDegreeRes, certificationRes, preferredWorkTypeRes, securityClearanceLevelRes, technicalSkillRes, workAuthorizationRes] = await Promise.all([
                    fetchData(`${API_BASE_URL}/api/v1/countries`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-highest-degree-obtianed-data`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-currently-enrolled-degree-data`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-certification-data`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-preferred-work-type-data`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-security-clearance-level-data`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-technical-skill-data`),
                    fetchData(`${API_BASE_URL}/api/v1/user/get-work-authorization-data`),
                ]);

                // handle each response
                if (countriesRes.error || highestDegreeObtianedRes.error || currentlyEnrolledDegreeRes.error || certificationRes.error || preferredWorkTypeRes.error || securityClearanceLevelRes.error || technicalSkillRes.error || workAuthorizationRes.error) {
                    setError("Something went wrong while fetching data.");
                    return;
                }

                setCountries(countriesRes.data?.data ?? []);
                setHighestDegreeObtianedDetails(highestDegreeObtianedRes.data?.data ?? []);
                setCurrentlyEnrolledDegree(currentlyEnrolledDegreeRes.data?.data ?? []);
                setCertification(certificationRes.data?.data ?? []);
                setPreferredWorkType(preferredWorkTypeRes.data?.data ?? []);
                setsecurityClearanceLevel(securityClearanceLevelRes.data?.data ?? []);
                setTechnicalSkill(technicalSkillRes.data?.data ?? []);
                setWorkAuthorization(workAuthorizationRes.data?.data ?? []);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Unexpected error occurred.");
            }
        };
        fetchAll();
    }, []);


    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string; checked?: boolean; type?: string; } }
    ) => {
        const { name, value } = e.target;
        const type = (e.target as HTMLInputElement).type;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            const checkboxValue = (e.target as HTMLInputElement).value;

            if (name === "certifications" || name === "workType" || name === "technicalSkills") {
                setFormData((prev) => ({
                    ...prev,
                    [name]: checked
                        ? [...(prev[name as keyof typeof formData] as number[]), Number(checkboxValue)]
                        : (prev[name as keyof typeof formData] as number[]).filter((id) => id !== Number(checkboxValue)),
                }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleRadioChange = (
        name: string,
        value: string,
        checked: boolean
    ) => {
        handleInputChange({
            target: {
                name,
                value,
                checked,
                type: "radio",
            },
        });
    };

    const handleDateChange = (selectedDates: Date[], _dateStr: string) => {
        const date = selectedDates[0];
        setFormData(prev => ({
            ...prev,
            graduationDate: date ? date.toISOString() : '',
        }));
    };


    // Load states on country change
    const handleCountryChange = async (code: string) => {
        if (!code) {
            console.warn("Country code is empty or invalid.");
            setSelectedCountry('');
            setStates([]);
            setSelectedState('');
            return;
        }
        // const code = e.target.value;
        setSelectedCountry(code);
        setFormData(prev => ({
            ...prev,
            country: code,
        }))
        setSelectedState('');
        setStates([]);
        setStateError('');
        const { data, error } = await fetchData(`${API_BASE_URL}/api/v1/states/${code}`);
        if (error) return setStateError(error);
        setStates(data?.data ?? []);
    };
    // console.log(errors)
    const fullNameError = errors.fullName || "";
    const emailError = errors.email || "";
    const phoneNumberError = errors.phoneNumber || "";
    const countryError = errors.country || "";
    const statesError = errors.state || "";
    const cityError = errors.city || "";
    const linkedinError = errors.linkedin || "";
    const portfolioError = errors.portfolio || "";
    const highestDegreeError = errors.highestDegree || "";
    const currentlyEnrolledError = errors.currentlyEnrolled || "";
    const universityError = errors.university || "";
    const graduationDateError = errors.graduationDate || "";
    const yearsOfExperienceError = errors.yearsOfExperience || "";
    const certificationsError = errors.certifications || "";
    const otherCertificationError = errors.otherCertification || "";
    const securityClearanceError = errors.securityClearance || "";
    const workAuthorizationError = errors.workAuthorization || "";
    const workTypeError = errors.workType || "";
    const activelySeekingError = errors.activelySeeking || "";
    const profileVisibleError = errors.profileVisible || "";
    const technicalSkillsError = errors.technicalSkills || "";

    return (
        <>
            <PageBreadcrumb pageTitle={title} />
            <div className="space-y-6">
                <ComponentCard title="" is_show_button={true} button_text="Back" button_link="/admin/users">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <ComponentCard title="Basic Information">
                                <div className="space-y-6">
                                    <div className="full-name-container">
                                        <Label>Full Name<span className="text-red-500">*</span></Label>
                                        <Input name="fullName" value={formData.fullName} onChange={handleInputChange} error={!!fullNameError} hint={fullNameError} />
                                    </div>

                                    <div>
                                        <Label>Email Address<span className="text-red-500">*</span></Label>
                                        <Input name="email" value={formData.email} onChange={handleInputChange} error={!!emailError} hint={emailError} />
                                    </div>
                                    <div>
                                        <Label>Phone Number</Label>
                                        <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} error={!!phoneNumberError} hint={phoneNumberError} />
                                    </div>

                                    <div>
                                        <Label>Country of Residence<span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Select
                                                name="country"
                                                options={countries}
                                                placeholder="Select Country"
                                                onChange={(e: { target: { name: string; value: string } }) => {
                                                    void handleCountryChange(e.target.value);
                                                }}
                                                className="dark:bg-dark-900"
                                                labelKey="name"
                                                valueKey="isoCode"
                                                defaultValue={selectedCountry || formData.country}
                                                error={!!countryError}
                                                warn={countryError}
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon />
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>State/Province (If applicable)</Label>
                                        <div className="relative">
                                            <Select
                                                name="state"
                                                options={states}
                                                placeholder="Select State"
                                                onChange={(e: { target: { name: string; value: string } }) => {
                                                    const { name, value } = e.target;
                                                    setSelectedState(value);
                                                    setFormData(prev => ({ ...prev, [name]: value }));
                                                }}
                                                className="dark:bg-dark-900"
                                                labelKey="name"
                                                valueKey="isoCode"
                                                defaultValue={selectedState || formData.state}
                                                error={!!stateError}
                                                warn={stateError}
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon />
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>City<span className="text-red-500">*</span></Label>
                                        <Input name="city" value={formData.city} onChange={handleInputChange} error={!!cityError} hint={cityError} />
                                    </div>
                                    <div>
                                        <Label>LinkedIn Profile</Label>
                                        <Input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} error={!!linkedinError} hint={linkedinError} />
                                    </div>
                                    <div>
                                        <Label>GitHub/Portfolio</Label>
                                        <Input type="text" name="portfolio" value={formData.portfolio} onChange={handleInputChange} error={!!portfolioError} hint={portfolioError} />
                                    </div>
                                </div>
                            </ComponentCard>
                            <ComponentCard title="Education & Experience">
                                <div className="space-y-6">
                                    <div>
                                        <Label>Highest Degree Obtained<span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Select
                                                name="highestDegree"
                                                options={highestDegreeObtianedDetails}
                                                placeholder="Select One"
                                                onChange={handleInputChange}
                                                className="dark:bg-dark-900"
                                                labelKey="name"
                                                valueKey="id"
                                                defaultValue={formData.highestDegree}
                                                error={!!highestDegreeError}
                                                warn={highestDegreeError}
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon />
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Currently Enrolled In (If Applicable)</Label>
                                        <div className="relative">
                                            <Select
                                                name="currentlyEnrolled"
                                                options={currentlyEnrolledDegree}
                                                placeholder="Select One"
                                                onChange={handleInputChange}
                                                className="dark:bg-dark-900"
                                                labelKey="name"
                                                valueKey="id"
                                                defaultValue={formData.currentlyEnrolled}
                                                error={!!currentlyEnrolledError}
                                                warn={currentlyEnrolledError}
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon />
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>University Name (If enrolled or previously attended)</Label>
                                        <Input name="university" value={formData.university} onChange={handleInputChange} error={!!universityError} hint={universityError} />
                                    </div>

                                    <div>
                                        <DatePicker
                                            id="my-datepicker"
                                            label="Expected Graduation Date"
                                            placeholder="YYYY-MM-DD"
                                            onChange={handleDateChange}
                                            defaultDate={formData.graduationDate}
                                            required={true}
                                            error={!!graduationDateError}
                                            hint={graduationDateError}
                                        />
                                    </div>
                                    <div>
                                        <Label>Years of Experience in Tech/Cybersecurity</Label>
                                        <div className="relative">
                                            <Select
                                                name="yearsOfExperience"
                                                options={[
                                                    { id: "0", name: "0" },
                                                    { id: "1", name: "1" },
                                                    { id: "2", name: "2" },
                                                    { id: "3", name: "3" },
                                                    { id: "4", name: "4" },
                                                    { id: "5", name: "5" },
                                                    { id: "6", name: "6" },
                                                    { id: "7", name: "7" },
                                                    { id: "8", name: "8" },
                                                    { id: "9", name: "9" },
                                                    { id: "10", name: "10" },
                                                    { id: "10+", name: "10+" },
                                                ]}
                                                placeholder="Select an option"
                                                onChange={handleInputChange}
                                                className="dark:bg-dark-900"
                                                labelKey="name"
                                                valueKey="id"
                                                defaultValue={formData.yearsOfExperience}
                                                error={!!yearsOfExperienceError}
                                                warn={yearsOfExperienceError}
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon />
                                            </span>
                                        </div>
                                    </div>
                                    {certification?.length > 0 &&
                                        <div>
                                            <Label>Certifications (Select all that apply)</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {certification.map((item) => (
                                                    <Checkbox
                                                        key={item.id}
                                                        name="certifications"
                                                        value={item.id}
                                                        checked={formData.certifications.includes(item.id)}
                                                        onChange={(e) => {
                                                            const checked =
                                                                typeof e === "boolean"
                                                                    ? e
                                                                    : (e.target as HTMLInputElement).checked;
                                                            const value = item.id;

                                                            setFormData((prev) => {
                                                                const current = prev.certifications;
                                                                const updatedCerts = checked
                                                                    ? [...current, value] // add
                                                                    : current.filter((id) => id !== value); // remove

                                                                return {
                                                                    ...prev,
                                                                    certifications: updatedCerts,
                                                                    otherCertification:
                                                                        value === 9 && !checked ? "" : prev.otherCertification, // clear if 9 is unchecked
                                                                };
                                                            });

                                                            setShowOtherCertification(
                                                                (value === 9 || formData.certifications.includes(9)) && checked
                                                            );
                                                        }}
                                                        label={item.name}
                                                    />
                                                ))}
                                                {certificationsError && <small className="text-red-500 text-xs mt-1">{certificationsError}</small>}
                                            </div>
                                            {(formData.certifications.some(item => item == 9) || showOtherCertification) &&
                                                <div className="mt-3">
                                                    <Input name="otherCertification" value={formData.otherCertification} onChange={handleInputChange} error={!!otherCertificationError} hint={otherCertificationError} />
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            </ComponentCard>
                            <ComponentCard title="Work & Security Credentials" className="col-span-2">
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                        <div style={{ width: "100%" }}>
                                            <Label>Security Clearance Level (If Any)</Label>
                                            <div className="relative">
                                                <Select
                                                    name="securityClearance"
                                                    options={securityClearanceLevel}
                                                    placeholder="Select an option"
                                                    onChange={handleInputChange}
                                                    className="dark:bg-dark-900"
                                                    labelKey="name"
                                                    valueKey="id"
                                                    defaultValue={formData.securityClearance}
                                                    error={!!securityClearanceError}
                                                    warn={securityClearanceError}
                                                />
                                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                    <ChevronDownIcon />
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ width: "100%" }}>
                                            <Label>Work Authorization</Label>
                                            <div className="relative">
                                                <Select
                                                    name="workAuthorization"
                                                    options={workAuthorization}
                                                    placeholder="Select an option"
                                                    onChange={handleInputChange}
                                                    className="dark:bg-dark-900"
                                                    labelKey="name"
                                                    valueKey="id"
                                                    defaultValue={formData.workAuthorization}
                                                    error={!!workAuthorizationError}
                                                    warn={workAuthorizationError}
                                                />
                                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                    <ChevronDownIcon />
                                                </span>
                                            </div>
                                        </div>

                                        {preferredWorkType?.length > 0 &&
                                            <div style={{ width: "100%" }}>
                                                <Label>Preferred Work Type</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {preferredWorkType.map((item) => (
                                                        <Checkbox
                                                            key={item.id}
                                                            name="workType"
                                                            value={item.id}
                                                            checked={formData.workType.includes(item.id)}
                                                            onChange={(e) => {
                                                                const checked =
                                                                    typeof e === "boolean"
                                                                        ? e
                                                                        : (e.target as HTMLInputElement).checked;
                                                                const value = item.id;

                                                                setFormData((prev) => {
                                                                    const current = prev.workType;
                                                                    return {
                                                                        ...prev,
                                                                        workType: checked
                                                                            ? [...current, value] // add
                                                                            : current.filter((id) => id !== value), // remove
                                                                    };
                                                                });
                                                            }}
                                                            label={item.name}
                                                        />
                                                    ))}
                                                    {workTypeError && <small className="text-red-500 text-xs mt-1">{workTypeError}</small>}
                                                </div>
                                            </div>
                                        }
                                        <div style={{ width: "100%" }}>
                                            <Label>Actively Seeking a Job?</Label>
                                            <Radio
                                                id="job-yes"
                                                name="activelySeeking"
                                                value="true"
                                                checked={isTrue(formData.activelySeeking)}
                                                onChange={(e) =>
                                                    handleRadioChange("activelySeeking", "true", e.currentTarget.checked)
                                                }
                                                label="Yes"
                                            />
                                            <Radio
                                                id="job-no"
                                                name="activelySeeking"
                                                value="false"
                                                checked={isFalse(formData.activelySeeking)}
                                                onChange={(e) =>
                                                    handleRadioChange("activelySeeking", "false", e.currentTarget.checked)
                                                }
                                                label="No"
                                            />
                                            {activelySeekingError && <small className="text-red-500 text-xs mt-1">{activelySeekingError}</small>}
                                        </div>
                                        <div style={{ width: "100%" }}>
                                            <Label>Would you like employers to see your profile?</Label>
                                            <Radio
                                                id="yes1"
                                                name="profileVisible"
                                                value="true"
                                                checked={isTrue(formData.profileVisible)}
                                                onChange={(e) =>
                                                    handleRadioChange("profileVisible", "true", e.currentTarget.checked)
                                                }
                                                label="Yes"
                                            />

                                            <Radio
                                                id="no1"
                                                name="profileVisible"
                                                value="false"
                                                checked={isFalse(formData.profileVisible)}
                                                onChange={(e) =>
                                                    handleRadioChange("profileVisible", "false", e.currentTarget.checked)
                                                }
                                                label="No"
                                            />
                                            {profileVisibleError && <small className="text-red-500 text-xs mt-1">{profileVisibleError}</small>}
                                        </div>
                                        {technicalSkill?.length > 0 &&
                                            <div style={{ width: "100%" }}>
                                                <Label>Technical Skills</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {technicalSkill.map((item) => (
                                                        <Checkbox
                                                            key={item.id}
                                                            name="technicalSkills"
                                                            value={item.id}
                                                            checked={formData.technicalSkills.includes(item.id)}
                                                            onChange={(e) => {
                                                                const checked =
                                                                    typeof e === "boolean"
                                                                        ? e
                                                                        : (e.target as HTMLInputElement).checked;
                                                                const value = item.id;

                                                                setFormData((prev) => {
                                                                    const current = prev.technicalSkills;
                                                                    return {
                                                                        ...prev,
                                                                        technicalSkills: checked
                                                                            ? [...current, value] // add
                                                                            : current.filter((id) => id !== value), // remove
                                                                    };
                                                                });
                                                            }}
                                                            label={item.name}
                                                        />
                                                    ))}
                                                    {technicalSkillsError && <small className="text-red-500 text-xs mt-1">{technicalSkillsError}</small>}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <Button size="sm" variant="primary" disabled={loading}>
                                    {isEdit ? "Update" : "Submit"}
                                </Button>
                            </ComponentCard>

                        </div>
                    </form>
                </ComponentCard>
            </div>
        </>
    )
}