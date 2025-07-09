"use client";
import { useState,useEffect } from "react";
import StepProgressBar from "@/components/common/StepProgressBar";
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from "@/components/config/config";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { firstStepSchema } from "@/lib/validations/domains/instructor/registration/firstStep";
import { secondStepSchema } from "@/lib/validations/domains/instructor/registration/secondStep";
import { thirdStepSchema } from "@/lib/validations/domains/instructor/registration/thirdStep";
import { useNotification } from '@/context/NotificationContext';
import LoadingButton from "@/components/form/LoadingButton";
import { redirect } from "next/navigation";
import { useLoading } from '@/context/LoadingContext';
export default function InstructorSignUp() {
    type FirstStepSchema = z.infer<typeof firstStepSchema>;
    type SecondStepSchema = z.infer<typeof secondStepSchema>;
    type ThirdStepSchema = z.infer<typeof thirdStepSchema>;
    type FormData = FirstStepSchema & SecondStepSchema & ThirdStepSchema;
    const [step, setStep] = useState(1);
    const userPlaceholder = '/web/images/user-placeholder.jpg';
    const [profile, setProfile] = useState(userPlaceholder);
    const { showNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showsubmit, setShowSubmit] = useState<boolean>(false);
    const [showtermscondition, setShowTermsCondition] = useState<boolean>(false);
    const { setLoading } = useLoading();
    const [processing, setProccessing] = useState<boolean>(false);
    useEffect(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
    }, [step]);
    const [formData, setFormData] = useState({
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
    const initialFormData = {
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
    }
    const combinedSchema = firstStepSchema.merge(secondStepSchema).merge(thirdStepSchema)
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        trigger,
        setValue,
        reset
    } = useForm<FormData>({
        resolver: zodResolver(combinedSchema),
        mode: "onChange",
        shouldUnregister: true
    });
    const nextStep = async () => {
        setProccessing(true);
        let stepFields: (keyof FormData)[] = [];
        switch (step) {
            case 1:
                stepFields = ["fullName", "email", "phoneNumber", "profilePic"];
                break;
            case 2:
                stepFields = ["jobTitle", "organization", "bio"];
                break;
            case 3:
                stepFields = ["expectedStudents", "topicTeach", "termsCondition"]
                break;
        }
        const isValidStep = await trigger(stepFields);
        if (isValidStep) {
            if (step < 3) {
                setProccessing(false);
                return setStep((prev) => prev + 1)
            }
        };
        setProccessing(false);

    };
    const prevStep = () => setStep((prev) => prev - 1);
    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target;
        if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
            const newFile = e.target.files[0];
            if (newFile) {
                setValue("profilePic", newFile, { shouldValidate: true });
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(newFile.type)) {
                    return;
                }
                const formdata = new FormData();
                formdata.append("file", newFile);
                try {
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
                    setProfile(url);
                    setFormData(prevState => ({
                        ...prevState,
                        profilePic: url
                    }));
                    const inputElement = e.target;
                    inputElement.value = '';
                } catch (error) {
                    console.error('Error uploading file:', error);
                } finally{
                    setLoading(false);
                }
            }
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setShowSubmit(checked);
        } else {
            const value = e.target.value;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleTermsAndConditionChange = () =>{
        setShowTermsCondition(!showtermscondition);
    }
    async function submitForm(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            const length = Object.keys(errors)?.length;
            if (length > 0) {
                return;
            }
            setIsSubmitting(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/instructor/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if(res.status == 409) {
                showNotification(
                    '',
                    `Account already Exist! Please Login to your account`,
                    'success'
                );
                setFormData(initialFormData);
                setStep(1);
                setTimeout(() => {
                    const encodedEmail = encodeURIComponent(formData.email);
                    return redirect(`/account-verify?email=${encodedEmail}&via=signup`);
                }, 1000);
            }
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            showNotification(
                '',
                `Thank you for signing up!\nWe are currently reviewing your account and will notify you by email once it's approved.We appreciate your patience!`,
                'success'
            );
            setFormData(initialFormData);
            setStep(1);
            setTimeout(() => {
                const encodedEmail = encodeURIComponent(formData.email);
                return redirect(`/account-verify?email=${encodedEmail}&via=signup`);
            }, 1000);
        } catch (error) {
            showNotification(
                '',
                `There was a problem completing your registration. Please try again later or contact support if the issue persists.\nplease check and confirm`,
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <section className="instructor">
            <div className="container mx-auto">
                <div className="inner-login">
                    <div className="card card-bg-img bg-white">
                        <div className="right-form-content">
                            <div className="title">
                                <h2>Instructor</h2>
                            </div>
                            <div className="text">
                                <p>Create your account.</p>
                            </div>
                            <form className="form" onSubmit={submitForm}>
                                <StepProgressBar
                                    steps={3}
                                    currentStep={step}
                                    progress_titles={["Basic Information", "Education & Experience", "Work & Security Credentials"]}
                                />
                                <div className="instructor-steps-form">
                                    {/* Steps */}
                                    {step == 1 &&
                                        <div className="form-step active">
                                            <div className="title">
                                                <h2>Personal Information</h2>
                                            </div>
                                            <div className="form-fields-box">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Full Name <span className="required">*</span></label>
                                                            <input type="text" {...register('fullName')} className="form-control" value={formData.fullName} onChange={handleInputChange} />
                                                            {errors.fullName && (<p className="text-red-500 text-sm">{errors.fullName.message}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Email Address <span className="required">*</span></label>
                                                            <input type="text" {...register('email')} value={formData.email} onChange={handleInputChange} className="form-control" />
                                                            {errors.email && (<p className="text-red-500 text-sm">{errors.email.message}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Phone Number</label>
                                                            <input type="text" {...register('phoneNumber')} value={formData.phoneNumber} onChange={handleInputChange} className="form-control" />
                                                            {errors.phoneNumber && (<p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="avatar-upload">
                                                            <div className="avatar-edit">
                                                                <input type="file" {...register('profilePic')} name="profilePic" id="imageUpload" onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    // trigger('profilePic');          
                                                                }} />
                                                                <label htmlFor="imageUpload"><i className="fa-solid fa-camera" /></label>
                                                            </div>
                                                            <div className="avatar-preview">
                                                                <div id="imagePreview" style={{ backgroundImage: `url(${profile})` }}>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errors.profilePic?.message && (
                                                            <p className="text-red-500 text-sm">{errors.profilePic.message}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {!processing && <div className="next-btn">
                                                <a className="btn btn-next" onClick={nextStep}>Next</a>
                                            </div>}
                                            
                                        </div>
                                    }
                                    {step == 2 &&
                                        <div className="form-step active">
                                            <div className="title">
                                                <h2>Professional Information</h2>
                                            </div>
                                            <div className="form-fields-box">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Job Title / Position <span className="required">*</span></label>
                                                            <input type="text" {...register('jobTitle')} value={formData.jobTitle} name="jobTitle" onChange={handleInputChange} className="form-control" />
                                                            {errors.jobTitle?.message && (
                                                                <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Institution/Organization</label>
                                                            <input type="text"  {...register('organization')} name="organization" onChange={handleInputChange} value={formData.organization} className="form-control" />
                                                        </div>
                                                        {errors.organization?.message && (
                                                            <p className="text-red-500 text-sm">{errors.organization.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="input-group col-span-1 md:col-span-2">
                                                        <div className="form-group">
                                                            <label>Short Bio</label>
                                                            <textarea {...register('bio')} defaultValue={formData.bio} name="bio" onChange={handleInputChange} />
                                                        </div>
                                                        {errors.bio?.message && (
                                                            <p className="text-red-500 text-sm">{errors.bio.message}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="btn-group">
                                                <a className="btn btn-prev" onClick={prevStep}>Previous</a>
                                                {!processing && <div className="next-btn">
                                                <a className="btn btn-next" onClick={nextStep}>Next</a>
                                            </div>}
                                            </div>
                                        </div>
                                    }
                                    {step == 3 &&
                                        <div className="form-step active">
                                            <div className="title">
                                                <h2>Teaching Information</h2>
                                            </div>
                                            <div className="form-fields-box">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Expected Number of Students Per Year <span className="required">*</span></label>
                                                            <input
                                                                type="number"
                                                                {...register("expectedStudents")}
                                                                name="expectedStudents"
                                                                value={formData.expectedStudents}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                            />
                                                        </div>
                                                        {errors.expectedStudents?.message && (
                                                            <p className="text-red-500 text-sm">{errors.expectedStudents.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Topics You Want to Teach <span className="required">*</span></label>
                                                            <input type="text"  {...register("topicTeach")} name="topicTeach" value={formData.topicTeach} onChange={handleInputChange} className="form-control" />
                                                        </div>
                                                        {errors.topicTeach?.message && (
                                                            <p className="text-red-500 text-sm">{errors.topicTeach.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="input-group col-span-1 md:col-span-2">
                                                        <div className="form-group">
                                                        <ul>
                                                        <li className="terma-conditions-checkbox">
                                                            <label htmlFor="linux">
                                                                <span className="check-input">
                                                                    <input
                                                                    type="checkbox"
                                                                    id="linux"
                                                                    {...register("termsCondition")}
                                                                    onChange={handleInputChange}
                                                                    name="termsCondition"
                                                                    />
                                                                </span>
                                                                <span>
                                                                    I agree to receive 5% of the total tuition paid by students I refer, paid via Stripe at the end of each semester.
                                                                    <a
                                                                    className=""
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleTermsAndConditionChange();
                                                                    }}
                                                                    >
                                                                    Terms &amp; Conditions
                                                                    </a>
                                                                </span>
                                                            </label>
                                                        </li>
                                                        </ul>

                                                        </div>
                                                        {errors.termsCondition && (
                                                            <p className="text-red-500 text-sm">{errors.termsCondition.message}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="btn-group">
                                                <a className="btn btn-prev" onClick={prevStep}>Previous</a>
                                                {
                                                    showsubmit && (
                                                        <LoadingButton
                                                            isLoading={isSubmitting}
                                                            type="submit"
                                                            className="btn-complete"
                                                            onClick={nextStep}
                                                        >
                                                            Submit
                                                        </LoadingButton>)
                                                }

                                                {/* <input type="submit" defaultValue="Submit" name="complete" value="Submit" onClick={ nextStep } className="btn btn-complete" /> */}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {showtermscondition && (
                <div className="terms-modal">
                    <div className="fixed z-10 overflow-y-auto top-0 w-full left-0" id="modal">
                        <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity">
                                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="modal-custom-width inline-block align-center bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                                <div className="term-content-card bg-white">
                                    <div className="modal-close-btn">
                                        <button onClick={() => handleTermsAndConditionChange()} type="button"><i className="fa-solid fa-xmark"></i></button>
                                    </div>
                                    <div className="terms-modal-content">
                                        <div className="title">
                                            <h2><span className="terms-icon">📜</span> Instructor Terms & Conditions </h2>
                                        </div>

                                        <div className="term-sub-text">
                                            <span>Effective: March 2025</span>
                                            <div className="text">
                                                <p>Welcome to Practical Academy! By signing up as an instructor, you agree to the following terms and conditions that
                                                    govern your relationship with our platform.</p>
                                            </div>
                                        </div>


                                        <div className="terms-content">
                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>1.</span> <span className="sub-head-icon">🧑‍🏫</span> Instructor Role & Responsibilities</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You agree to deliver high-quality, original course content to students enrolled via Practical Academy.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You are responsible for maintaining academic integrity and a respectful, inclusive learning environment.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You must ensure all content you upload (videos, labs, materials) is free from copyright infringement and aligns with Practical Academy's educational mission.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>2.</span> <span className="sub-head-icon">💰</span> Affiliate Revenue Share (5%)</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">As an instructor, you will earn <strong>5% of the total revenue</strong> from students who enroll in your courses through your <strong>unique referral link</strong>.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Earnings are calculated at the end of each semester (Spring, Summer, Fall, Winter) and reported in your instructor dashboard.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Tracking and reporting are handled automatically through your referral URL.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>3.</span> <span className="sub-head-icon">🏦</span> Stripe Payouts</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">All instructor earnings are paid via <strong>Stripe Connect</strong>.</span>
                                                        </li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You must create or connect a <strong>Stripe Express account</strong> to receive payouts.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Stripe may require identity verification (e.g., ID, bank account) as part of compliance.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Payouts are made <strong>at the end of each semester</strong>, following a review period to finalize enrollments.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>4.</span> <span className="sub-head-icon">💼</span> Taxes & Reporting</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You are responsible for reporting your income and handling taxes in your country.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Practical Academy and Stripe will issue any relevant tax forms (e.g., 1099-K in the U.S.) where applicable.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>5.</span> <span className="sub-head-icon">📷</span> Profile Use & Course Marketing</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Your profile <strong>picture</strong>, <strong>bio</strong>, and <strong>credentials</strong> may be displayed publicly alongside your courses.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">We may also use this information for marketing purposes across our website and social media.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>6.</span> <span className="sub-head-icon">🧾</span> Course Ownership & Intellectual Property</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">By publishing your course on Practical Academy, you grant us a <strong>perpetual</strong>, <strong>royalty-free</strong>, <strong>worldwide license</strong> to host, display, distribute, and promote the course on our platform.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text"><strong>Practical Academy retains ownership of all course content hosted on our platform</strong>.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">If Practical Academy produces <strong>YouTube videos</strong> or derivative content for your courses, these assets are the <strong>intellectual property of Practical Academy</strong>.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Instructors may not republish full course content elsewhere unless granted explicit permission in writing.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>7.</span> <span className="sub-head-icon">🚫</span> Termination & Account Removal</h4>
                                                </div>

                                                <div className="text">
                                                    <p>We reserve the right to suspend or terminate your instructor account if:</p>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You violate these terms or applicable laws</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You misuse student data or violate academic standards</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Your course receives repeated negative feedback or inactivity over multiple semesters</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>8.</span> <span className="sub-head-icon">📈</span> Instructor Expectations</h4>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You agree to keep course materials reasonably up to date.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You are encouraged to engage with enrolled students and respond to reasonable questions.</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">You will estimate and provide the <strong>expected number of students you can teach per year</strong> during onboarding.</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-content-box">
                                                <div className="term-sub-title">
                                                    <h4><span>9.</span> <span className="sub-head-icon">✅</span> Acceptance</h4>
                                                </div>

                                                <div className="text">
                                                    <p>By submitting the instructor signup form, you confirm that you:</p>
                                                </div>

                                                <div className="terms-list">
                                                    <ul>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Agree to all terms listed here</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Consent to Stripe handling your payouts</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Understand that Practical Academy owns hosted and promoted course content</span></li>
                                                        <li> <span className="list-icon"></span> <span className="term-list-text">Accept that these terms may evolve with notice</span></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="terms-foot-conent">
                                                <p>Questions? Contact <a href="#">admin@practicalacademy.org</a></p>
                                                <p>Let’s build something amazing together <span>🚀</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>

    )
}