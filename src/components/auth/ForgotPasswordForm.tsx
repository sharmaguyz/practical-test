"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { useState } from "react";
import Alert from "@/components/ui/alert/Alert";
import { API_BASE_URL } from "@/components/config/config";
export default function ForgotPasswordForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage,setSuccessMessage] = useState<string>("");
    const [errorMessage,setErrorMessage] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const [formData, setFormData] = useState<{ email:string}>({ email: ""});
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/forgot-password`, {
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
                (e.target as HTMLFormElement).reset();
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
                            Forgot Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your email!
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <Label>  Email <span className="text-error-500">*</span>{" "}</Label>
                                    <Input
                                        name="email"
                                        placeholder="info@gmail.com"
                                        type="email"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                [e.target.name]: e.target.value, // ✅ Correct syntax for dynamic keys
                                            }))
                                        }
                                    />
                                    {errors?.email && (
                                        <span className="text-red-500 text-sm">{errors.email}</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       
                                    </div>
                                    <Link
                                        href="/admin/signin"
                                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                        Log In
                                    </Link>
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