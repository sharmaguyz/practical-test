"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/components/config/config";
import { useNotification } from '@/context/NotificationContext';
type ResetPasswordFormProps = {
    email: string;
};
export default function ResetPasswordForm({ email }: ResetPasswordFormProps) {
    const [formData, setFormData] = useState<{ newPassword: string, reset_password: string, token: string, email: string }>({ newPassword: "", reset_password: "", token: "", email: "" });
    const params = useParams();
    const token = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { showNotification } = useNotification();
    useEffect(() => {
        if (token) {
            setFormData((prev) => ({
                ...prev,
                token: token,
                email: email
            }));
        }
    }, [token]);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/reset-password`, {
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
                throw new Error(data.message || "Account verification failed!");
            }
            showNotification(
                '', 
                `Your password has been reset successfully. Now you can login and access your dashboard.!`, 
                'success'
            );
            setFormData(prevState => ({
                ...prevState,
                email: "",
                newPassword : "",
                reset_password:"",
                token:""
            }));
            setTimeout(() => {
                return redirect("/signin");
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
    }
    return (
        <section className="forgot-password">
            <div className="container mx-auto">
                <div className="inner-forgot-password">
                    <div className="card card-bg-img bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 items-center">
                            <div className="right-form-content">
                                <div className="title">
                                    <h2>Reset Password</h2>
                                </div>
                                <div className="text">
                                    <p>
                                        Enter your new password, and confirm password.
                                    </p>
                                </div>
                                <form className="forgot-password-form" onSubmit={handleSubmit}>
                                    <div className="form-fields-box">
                                        <div className="form-group">
                                            <input
                                                type="password"
                                                name="newPassword"
                                                id=""
                                                className="form-control"
                                                placeholder="Enter Your new password"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: e.target.value
                                                    }))
                                                }
                                            />
                                            {errors?.newPassword && (
                                                <span className="text-red-500 text-sm">{errors.newPassword}</span>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="password"
                                                name="reset_password"
                                                id=""
                                                className="form-control"
                                                placeholder="Enter Your confirm password"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: e.target.value
                                                    }))
                                                }
                                            />
                                            {errors?.reset_password && (
                                                <span className="text-red-500 text-sm">{errors.reset_password}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="forgot-pass-btn">
                                        <button type="submit" disabled={loading}>
                                            <span>{loading ? "Please wait" : "Submit"}</span>{" "}
                                            <span>
                                                <img src="/web/images/maki_arrow.png" alt="" />
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="left-form-img">
                                <img src="/web/images/Forgot-Password.png" alt="" />
                            </div>
                        </div>
                    </div>
                    {/* </div> */}
                </div>
            </div>
        </section>
    )
}