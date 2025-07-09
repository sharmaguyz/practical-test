"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { useState,useEffect } from "react";
import Alert from "@/components/ui/alert/Alert";
import { API_BASE_URL } from "@/components/config/config";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
type ResetPasswordFormProps = {
    email: string;
};
export default function ResetPasswordForm({ email } : ResetPasswordFormProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage,setSuccessMessage] = useState<string>("");
    const [errorMessage,setErrorMessage] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const [formData, setFormData] = useState<{ newPassword:string,reset_password:string,token:string,email:string}>({ newPassword: "",reset_password:"",token:"",email:""});
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setResetPasswordShow] = useState(false);
    const params = useParams();
    const token = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";    
    useEffect(() => {
        if (token) {
          setFormData((prev) => ({
            ...prev,
            token: token,
            email:email
          }));
        }
    }, [token]);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/reset-password`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
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
                setErrorMessage(data.message);
            }else{
                setSuccessMessage(data.message);
                setTimeout(() => {
                    return redirect("/admin/signin");
                }, 5000);
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        {successMessage && (  
                            <Alert
                                variant="success"
                                title="Success Message"
                                message={successMessage}
                                showLink={false}
                            />
                        )}
                        {errorMessage && ( <Alert
                            variant="error"
                            title="Warning Message"
                            message={errorMessage}
                            showLink={false}
                        />)}
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Reset Password
                        </h1>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <Label> New Password <span className="text-error-500">*</span>{" "}</Label>
                                    <div className="relative">
                                        <Input
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setFormData((prev) => ({
                                                ...prev,
                                                [e.target.name]: e.target.value, // ✅ Correct syntax for dynamic keys
                                                }))
                                            }
                                            name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your new password"
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                            )}
                                        </span>
                                    </div>
                                    {errors?.newPassword && (
                                        <span className="text-red-500 text-sm">{errors.newPassword}</span>
                                    )}
                                </div>
                                <div>
                                    <Label> Reset Password <span className="text-error-500">*</span>{" "}</Label>
                                    <div className="relative">
                                        <Input
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                [e.target.name]: e.target.value,
                                                }))
                                            }
                                            name="reset_password"
                                            type={showResetPassword ? "text" : "password"}
                                            placeholder="Enter your new password"
                                        />
                                        <span
                                            onClick={() => setResetPasswordShow(!showResetPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                        {showResetPassword ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                        )}
                                        </span>
                                    </div>
                                    {errors?.reset_password && (
                                        <span className="text-red-500 text-sm">{errors.reset_password}</span>
                                    )}
                                </div>
                                <div>
                                    <Button disabled={loading ? true : false} className="w-full" size="sm">
                                        {loading ? 'Please wait' : 'Submit'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}