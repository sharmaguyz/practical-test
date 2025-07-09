"use client";
import { useState, useEffect, useRef } from "react";
import { fetchData } from "@/helpers/apiHelper";
import StepProgressBar from "@/components/common/StepProgressBar";
import { useForm, Controller } from 'react-hook-form';
import { API_BASE_URL } from "@/components/config/config";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { basicInfoSchema } from "@/lib/validations/domains/user/registration/basic-inforamtion.schema";
import { educationSchema } from "@/lib/validations/domains/user/registration/education-and-experience.schema";
import { workSchema } from "@/lib/validations/domains/user/registration/work-and-security.schema";
import CustomDatePicker from "@/components/form/CustomDatePicker";
import LoadingButton from "@/components/form/LoadingButton";
import { useNotification } from '@/context/NotificationContext'
import { redirect } from "next/navigation";

const mergedSchema = z.object({
    ...(basicInfoSchema._def.schema as z.ZodObject<any>).shape,
    ...(educationSchema._def.schema as z.ZodObject<any>).shape,
    ...workSchema.shape // Assuming workSchema is a pure ZodObject
});

const formSchema = z.object({
    basicInfo: basicInfoSchema,
    education: educationSchema,
    work: workSchema
});

export type FormData = z.infer<typeof mergedSchema>;

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

export default function UserSignUp() {
    const { showNotification } = useNotification()
    const [step, setStep] = useState(1);
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
    const [showOtherCertification, setShowOtherCertification] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stateError, setStateError] = useState("");
    const initialFormData = {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
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
        activelySeeking: false,
        profileVisible: false,
        technicalSkills: [] as number[],
        rolename : 'STUDENT'
    }
    const [formData, setFormData] = useState(initialFormData);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
          const checked = (e.target as HTMLInputElement).checked;
          const checkboxValue = (e.target as HTMLInputElement).value;
          
          if (name === 'certifications' || name === 'workType' || name === 'technicalSkills') {
            setFormData(prev => ({
              ...prev,
              [name]: checked 
                ? [...prev[name as keyof typeof formData] as number[], Number(checkboxValue)]
                : (prev[name as keyof typeof formData] as number[]).filter(id => id !== Number(checkboxValue))
            }));
          }
        } else if (type === 'radio') {
          setFormData(prev => ({ ...prev, [name]: value }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Optional smooth scrolling
        });
    }, [step]);
    const {
        getValues,
        register,
        control,
        handleSubmit,
        formState: { errors, isValid },
        trigger,
        setValue,
        watch,
        reset,
        setError,
        clearErrors
      } = useForm<FormData>({
        resolver: zodResolver(mergedSchema),
        mode: "all",
        defaultValues: {
            certifications: [],
            workType: [],
            technicalSkills: [],
            graduationDate: ""
        }
    });
    
    const selectedCertifications = watch('certifications') || [];
    const selectedWorkType = watch('workType') || [];
    const selectedTechnicalSkills = watch('technicalSkills') || [];
    const password = watch('password');

    // Add this effect for real-time password validation

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const subscription = watch((values) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const { password, confirmPassword } = values;
            if (password && confirmPassword) {
              if (password !== confirmPassword) {
                setError('confirmPassword', {
                  type: 'manual',
                  message: 'Passwords do not match'
                }, { shouldFocus: false });
              } else if (errors.confirmPassword) {
                clearErrors('confirmPassword');
              }
            }
          }, 100); // Small debounce delay
        });
      
        return () => {
          clearTimeout(timeoutId);
          subscription.unsubscribe();
        };
      }, [watch, setError, clearErrors, errors.confirmPassword]);

    // const nextStep = async () => {
    //     // Helper to safely get schema shape (works for both raw ZodObject and refined ZodEffects)
    //     const getSchemaShape = (schema: z.ZodTypeAny): z.ZodRawShape => {
    //       if (schema instanceof z.ZodObject) {
    //         return schema.shape; // Already a ZodObject
    //       }
    //       if ('schema' in schema._def) {
    //         return (schema._def.schema as z.ZodObject<any>).shape; // Unwrap ZodEffects
    //       }
    //       throw new Error("Cannot get shape from this schema type");
    //     };
      
    //     // Get field names for current step
    //     const getStepFields = () => {
    //       if (step === 1) return Object.keys(getSchemaShape(basicInfoSchema));
    //       if (step === 2) return Object.keys(getSchemaShape(educationSchema));
    //       return Object.keys(workSchema.shape); // Assuming workSchema is a pure ZodObject
    //     };
      
    //     const isValid = await trigger(getStepFields() as any);
    //     if (isValid) setStep((prev) => prev + 1);
    // };
   
    
    const nextStep = async () => {
        const getSchemaShape = (schema: z.ZodTypeAny): z.ZodRawShape => {
          if (schema instanceof z.ZodObject) return schema.shape;
          if ('schema' in schema._def) return (schema._def.schema as z.ZodObject<any>).shape;
          throw new Error("Cannot get shape from this schema type");
        };
    
        const getStepFields = () => {
          if (step === 1) return Object.keys(getSchemaShape(basicInfoSchema));
          if (step === 2) return Object.keys(getSchemaShape(educationSchema));
          return Object.keys(workSchema.shape);
        };
    
        const isValid = await trigger(getStepFields() as any);
    
        // Additional password confirmation check
        if (step === 1 && isValid) {
          const { password, confirmPassword } = getValues();
          if (password !== confirmPassword) {
            setError('confirmPassword', {
              type: 'manual',
              message: 'Passwords do not match'
            });
            return;
          }
        }
    
        if (isValid) setStep((prev) => prev + 1);
      };
    
    const prevStep = () => setStep((prev) => prev - 1);

    useEffect(() => {
        const fetchAll = async () => {
          try {
            const [countriesRes, highestDegreeObtianedRes, currentlyEnrolledDegreeRes, certificationRes, preferredWorkTypeRes, securityClearanceLevelRes,  technicalSkillRes, workAuthorizationRes ] = await Promise.all([
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
              console.log("Something went wrong while fetching data.");
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
            // setError("Unexpected error occurred.");
          }
        };
        fetchAll();
    }, []);

    const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const value = e.target.value;
        const newValue = isChecked
        ? Array.from(new Set([...selectedCertifications, value]))
        : selectedCertifications.filter((item: string | number) => item !== value);
    
        setValue('certifications', newValue);
        trigger('certifications');
        handleInputChange(e);
        if (Number(value) === 9) {
          setShowOtherCertification(isChecked);
        }
    };

    const handleWorkType = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const value = e.target.value;
        const newValue = isChecked
        ? Array.from(new Set([...selectedWorkType, value]))
        : selectedWorkType.filter((item:string | number) => item !== value);
    
        setValue('workType', newValue);
        trigger('workType');
        handleInputChange(e);
    };

    const handleTechnicalSkills = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const value = e.target.value;
        const newValue = isChecked
        ? Array.from(new Set([...selectedTechnicalSkills, value]))
        : selectedTechnicalSkills.filter((item: string | number) => item !== value);
    
        setValue('technicalSkills', newValue);
        trigger('technicalSkills');
        handleInputChange(e);
    };

    // Load states on country change
    const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
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

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            });
            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    throw { type: 'validation', errors: errorData.errors || errorData };
                }
                throw new Error(`Error: ${response.status}`);
            }
            showNotification(
                '', 
                `Thank you for signing up!\nWe are currently reviewing your account and will notify you by email once it's approved.We appreciate your patience!`, 
                'success'
            );
            setFormData(initialFormData);
            reset(initialFormData);
            setStep(1);
            setSelectedState('');
            setSelectedCountry('');
            setStates([]);
            setShowOtherCertification(false);
            setTimeout(() => {
                const encodedEmail = encodeURIComponent(formData.email);
                redirect(`/account-verify?email=${encodedEmail}&via=signup`);
            }, 5000);
        } catch (error:any) {
            let msg = `There was a problem completing your registration. Please try again later or contact support if the issue persists.\nplease check and confirm`;
            if (error?.type === "validation" && Array.isArray(error.errors)) {
                msg = error.errors
                    .map((err: any) => {
                        const key = Object.keys(err)[0];
                        const value = err[key];
                        return `${key}: ${value}`;
                    })
                    .join('\n');
            }
            showNotification(
                '', 
                msg, 
                'error'
            );
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <section className="register">
            <div className="container mx-auto">
                <div className="inner-login">
                    <div className="card card-bg-img bg-white">
                        <div className="right-form-content">
                            <div className="title">
                                <h2>Register</h2>
                            </div>
                            <div className="text">
                                <p>Create your account.</p>
                            </div>
                            <form method="post" className="form" onSubmit={handleSubmit(onSubmit)}>
                                {/* Progress Bar */}
                                <StepProgressBar 
                                    steps={3} 
                                    currentStep={step} 
                                    progress_titles={["Basic Information", "Education & Experience", "Work & Security Credentials"]} 
                                />
                                <div className="register-steps-form">
                                {/* Steps */}
                                    {step === 1 &&
                                        <div className="form-step active">
                                            <div className="title">
                                                <h2>Basic Information</h2>
                                            </div>
                                            <div className="form-fields-box">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Full Name <span className="required">*</span></label>
                                                            <input {...register('fullName')} className="form-control"  value={formData.fullName} onChange={handleInputChange} />
                                                            {errors?.fullName?.message && (<p className="text-red-500 text-sm">{String(errors.fullName.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Email Address <span className="required">*</span></label>
                                                            <input {...register('email')} className="form-control" type="email" value={formData.email} onChange={handleInputChange} />
                                                            {errors?.email?.message && (<p className="text-red-500 text-sm">{String(errors.email.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Create Password <span className="required">*</span></label>
                                                            <input {...register('password')} className="form-control" type="password" value={formData.password} onChange={handleInputChange} />
                                                            {errors?.password?.message && (<p className="text-red-500 text-sm">{String(errors.password.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Confirm Password <span className="required">*</span></label>
                                                            <input {...register('confirmPassword')} className="form-control" type="password" onChange={handleInputChange}/>
                                                            {errors?.confirmPassword?.message && (<p className="text-red-500 text-sm">{String(errors.confirmPassword.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Phone Number</label>
                                                            <input {...register('phoneNumber')} className="form-control" value={formData.phoneNumber} onChange={handleInputChange} />
                                                            {errors?.phoneNumber?.message && (<p className="text-red-500 text-sm">{String(errors.phoneNumber.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Country of Residence <span className="required">*</span></label>
                                                            <select {...register('country')} value={ selectedCountry } onChange={ handleCountryChange }>
                                                                <option value="">Select Country</option>
                                                                {countries?.length > 0 && countries.map((country) => (
                                                                    <option key={country.isoCode} value={country.isoCode}>
                                                                        {country.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors?.country?.message && (<p className="text-red-500 text-sm">{String(errors.country.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>State/Province (If applicable)</label>
                                                            <select {...register('state')} value={selectedState}
                                                                onChange={(e) => {
                                                                    setSelectedState(e.target.value)
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        state: e.target.value,
                                                                    }))
                                                                }
                                                            }>
                                                                <option value="">Select State</option>
                                                                {states?.length > 0 && states.map((state) => (
                                                                    <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                                                ))}
                                                            </select>
                                                            {stateError && (
                                                                <p className="text-yellow-600 text-sm">{stateError}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>City <span className="required">*</span></label>
                                                            <input {...register('city')} className="form-control" value={formData.city} onChange={handleInputChange} />
                                                            {errors?.city?.message && (<p className="text-red-500 text-sm">{String(errors.city.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>LinkedIn Profile</label>
                                                            <input {...register('linkedin')} className="form-control" value={formData.linkedin} onChange={handleInputChange} />
                                                            {errors?.linkedin?.message && (<p className="text-red-500 text-sm">{String(errors.linkedin.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>GitHub/Portfolio</label>
                                                            <input {...register('portfolio')} className="form-control" value={formData.portfolio} onChange={handleInputChange} />
                                                            {errors?.portfolio?.message && (<p className="text-red-500 text-sm">{String(errors.portfolio.message)}</p>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="next-btn">
                                                <button type="button" className="btn btn-next" onClick={ nextStep }>Next</button>
                                            </div>
                                        </div>
                                    }
                                    {step === 2 &&
                                        <div className="form-step active">
                                            <div className="title">
                                                <h2>Education &amp; Experience</h2>
                                            </div>
                                            <div className="form-fields-box">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Highest Degree Obtained <span className="required">*</span></label>
                                                            <select {...register('highestDegree')} value={formData.highestDegree} onChange={handleInputChange} >
                                                            <option value="">Select One</option>
                                                            {highestDegreeObtianedDetails?.length > 0 && highestDegreeObtianedDetails.map((highestDegreeObtianedDetail) => (
                                                                <option key={highestDegreeObtianedDetail.id} value={highestDegreeObtianedDetail.id}>
                                                                    {highestDegreeObtianedDetail.name}
                                                                </option>
                                                            ))}
                                                            </select>
                                                            {errors?.highestDegree?.message && (<p className="text-red-500 text-sm">{String(errors.highestDegree.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Currently Enrolled In (If Applicable)</label>
                                                            <select {...register('currentlyEnrolled')} value={formData.currentlyEnrolled} onChange={handleInputChange}>
                                                                <option value="">Select One</option>
                                                                {currentlyEnrolledDegree?.length > 0 && currentlyEnrolledDegree.map((degree) => (
                                                                    <option key={degree.id} value={degree.id}>
                                                                        {degree.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors?.currentlyEnrolled?.message && (<p className="text-red-500 text-sm">{String(errors.currentlyEnrolled.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group col-span-1 md:col-span-2">
                                                        <div className="form-group">
                                                            <label>University Name (If enrolled or previously attended)</label>
                                                            <input {...register('university')} className="form-control" value={formData.university} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <Controller
                                                                name="graduationDate"
                                                                control={control}
                                                                render={({ field }) => (
                                                                <CustomDatePicker
                                                                    selectedDate={field.value}
                                                                    onChange={(date) => {
                                                                        field.onChange(date); // updates RHF
                                                                        setFormData(prev => ({
                                                                          ...prev,
                                                                          graduationDate: date ? date.toISOString() : ''
                                                                        }));
                                                                    }}
                                                                    minDate={new Date()}
                                                                    label="Expected Graduation Date"
                                                                    placeholderText=""
                                                                    error={errors.graduationDate?.message ? String(errors.graduationDate.message) : ""}
                                                                    required
                                                                />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Years of Experience in Tech/Cybersecurity</label>
                                                            <select {...register('yearsOfExperience')} value={formData.yearsOfExperience} onChange={handleInputChange}>
                                                                <option value="">Select One</option>
                                                                <option value="0">0</option>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="3">3</option>
                                                                <option value="4">4</option>
                                                                <option value="5">5</option>
                                                                <option value="6">6</option>
                                                                <option value="7">7</option>
                                                                <option value="8">8</option>
                                                                <option value="9">9</option>
                                                                <option value="10">10</option>
                                                                <option value="10+">10+</option>
                                                            </select>
                                                            {errors?.yearsOfExperience?.message && (<p className="text-red-500 text-sm">{String(errors.yearsOfExperience.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    { certification?.length > 0 &&
                                                        <div className="input-group">
                                                            <div className="form-group">
                                                                <label>Certifications (Select all that apply)</label>
                                                                <ul>
                                                                    {certification.map((certificate) => (
                                                                        <li key={certificate.id}><label htmlFor={certificate.name.toLowerCase()}><input type="checkbox" value={String(certificate.id)} {...register('certifications')} id={certificate.name.toLowerCase()} checked={selectedCertifications.includes(String(certificate.id))} onChange={handleCertificationChange} />{certificate.name}</label></li>
                                                                    ))}
                                                                </ul>
                                                                {errors?.certifications?.message && (<p className="text-red-500 text-sm">{String(errors.certifications.message)}</p>)}
                                                                {  showOtherCertification &&
                                                                    <div className="other-c-field">
                                                                        <div className="form-group">
                                                                            <input {...register('otherCertification')} className="form-control" value={formData.otherCertification} onChange={handleInputChange} />
                                                                            {errors?.otherCertification?.message && (<p className="text-red-500 text-sm">{String(errors.otherCertification.message)}</p>)}
                                                                        </div>
                                                                    </div>
                                                                }
                                                               </div>
                                                        </div>
                                                    }

                                                </div>
                                            </div>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-prev" onClick={ prevStep }>Previous</button>
                                                <button type="button" className="btn btn-next" onClick={ nextStep }>Next</button>
                                            </div>
                                        </div>
                                    }
                                    {step === 3 &&
                                        <div className="form-step active">
                                            <div className="title">
                                                <h2>Work &amp; Security Credentials</h2>
                                            </div>
                                            <div className="form-fields-box">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Security Clearance Level (If Any)</label>
                                                            <select {...register('securityClearance')} value={formData.securityClearance} onChange={handleInputChange}>
                                                            <option value="">Select One</option>
                                                            {securityClearanceLevel?.length > 0 && securityClearanceLevel.map((level) => (
                                                                <option key={level.id} value={level.id}>
                                                                    {level.name}
                                                                </option>
                                                            ))}
                                                            </select>
                                                            {errors?.securityClearance?.message && (<p className="text-red-500 text-sm">{String(errors.securityClearance.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label>Work Authorization</label>
                                                            <select {...register('workAuthorization')} value={formData.workAuthorization} onChange={handleInputChange}>
                                                                <option value="">Select One</option>
                                                                {workAuthorization?.length > 0 && workAuthorization.map((work) => (
                                                                    <option key={work.id} value={work.id}>
                                                                        {work.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors?.workAuthorization?.message && (<p className="text-red-500 text-sm">{String(errors.workAuthorization.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    { preferredWorkType?.length > 0 && 
                                                        <div className="input-group">
                                                            <div className="form-group">
                                                                <label>Preferred Work Type</label>
                                                                <ul>
                                                                    {preferredWorkType.map((workType) => (
                                                                        <li key={workType.id}><label htmlFor={workType.name}><input type="checkbox" {...register('workType')} id={workType.name} value={String(workType.id)} checked={selectedWorkType.includes(String(workType.id))} onChange={handleWorkType} />{workType.name}</label></li>
                                                                    ))}
                                                                </ul>
                                                                {errors?.workType?.message && (<p className="text-red-500 text-sm">{String(errors.workType.message)}</p>)}
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label htmlFor="">Actively Seeking a Job?</label>
                                                            <div className="radio-fields">
                                                                <label htmlFor="job-yes"><input type="radio" {...register('activelySeeking')}  id="job-yes" value="true" onChange={handleInputChange} /> Yes</label>
                                                                <label htmlFor="job-no"><input type="radio" {...register('activelySeeking')} id="job-no" value="false" onChange={handleInputChange} defaultChecked /> No</label>
                                                            </div>
                                                            {errors?.activelySeeking?.message && (<p className="text-red-500 text-sm">{String(errors.activelySeeking.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="form-group">
                                                            <label htmlFor="">Would you like employers to see your profile?</label>
                                                            <div className="radio-fields">
                                                                <label htmlFor="yes1"><input type="radio" {...register('profileVisible')} id="yes1" value="true" onChange={handleInputChange} /> Yes</label>
                                                                <label htmlFor="no1"><input type="radio" {...register('profileVisible')} id="no1" value="false" onChange={handleInputChange} defaultChecked /> No</label>
                                                            </div>
                                                            {errors?.profileVisible?.message && (<p className="text-red-500 text-sm">{String(errors.profileVisible.message)}</p>)}
                                                        </div>
                                                    </div>
                                                    {
                                                        technicalSkill?.length > 0 &&
                                                        <div className="input-group">
                                                            <div className="form-group">
                                                                <label>Technical Skills</label>
                                                                <ul>
                                                                    {technicalSkill.map((skill) => (
                                                                        <li key={skill.id}><label htmlFor={skill.name}><input type="checkbox" {...register('technicalSkills')} id={skill.name} value={String(skill.id)} onChange={handleTechnicalSkills} checked={selectedTechnicalSkills.includes(String(skill.id))} />{skill.name}</label></li>
                                                                    ))}
                                                                </ul>
                                                                {errors?.technicalSkills?.message && (<p className="text-red-500 text-sm">{String(errors.technicalSkills.message)}</p>)}
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-prev" onClick={ prevStep }>Previous</button>
                                                <LoadingButton
                                                    isLoading={isSubmitting}
                                                    type="submit"
                                                    className="btn-complete"
                                                    >
                                                    Submit
                                                </LoadingButton>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}