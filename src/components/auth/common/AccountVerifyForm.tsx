"use client";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { useNotification } from '@/context/NotificationContext';
import { redirect, useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { useAuth } from "@/context/AuthContext";
export default function AccountVerifyForm() {
    const [formData, setFormData] = useState<{ code: string, email: string}>({ code: "", email: ""});
    const [mainloading, setMainLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const router = useRouter();
    const [showResend,setShowResend] = useState<boolean>(false);
    const { showNotification } = useNotification();
    const { setLoading } = useLoading();
    const { setAuth } = useAuth();
    const [via, setVia] = useState<string>("");
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const email = decodeURIComponent(urlParams.get('email') || '');
        const getVia = urlParams.get('via') || '';
        setVia(getVia);
        setFormData(prevState => ({
            ...prevState,
            email: email ?? ""
        }));
    }, []);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMainLoading(true);
        setErrors(null);
        setShowResend(false);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/verify-code`, {
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
            if (response.status === 401) {
                showNotification('',data.message, 'error');
                setTimeout(() => {
                    router.push("/signin");
                }, 5000);
                return;
            }
            if (response.status === 400) {
                showNotification('', data.message, 'success');
                setShowResend(true);
                return;
            }
            // if (response.status === 409) {
            //     showNotification('', 'Your account has already been verified! Please login.', 'success');
            //     setTimeout(() => {
            //         router.push("/signin");
            //     }, 5000);
            //     return;
            // }
            if (!response.ok) {
                throw new Error(data.message || "Account verification failed!");
            }
            const encodedPassword = localStorage.getItem('authenticate');
            if (encodedPassword) {
                showNotification('', `Your account has been verified successfully.`, 'success');
                try {
                    setLoading(true);
                    const decodedPassword = atob(encodedPassword);
                    const signinPayload = {
                        email: formData.email,
                        password: decodedPassword,
                        isChecked: false
                    };
                    const signinResponse = await fetch(`${API_BASE_URL}/api/v1/user/signin`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(signinPayload),
                    });
                    if (!signinResponse.ok) {
                        const signinError = await signinResponse.json();
                        throw new Error(signinError.message || "Signin failed");
                    }
                    const signinData = await signinResponse.json();
                    localStorage.setItem('token', signinData.data.token);
                    localStorage.setItem('rolename', signinData.data.role.name);
                    localStorage.setItem('IdToken', signinData.data.IdToken);
                    localStorage.setItem('AccessToken', signinData.data.AccessToken);
                    localStorage.setItem('RefreshToken', signinData.data.RefreshToken);
                    setAuth(signinData.data.role.name, signinData.data.token);
                    if (signinData.data.role.name === "INSTRUCTOR") {
                        router.push("/instructor/dashboard");
                    } else if (signinData.data.role.name === "STUDENT") {
                        router.push("/dashboard");
                    }
                } catch (signinError) {
                    router.push("/signin");
                } finally {
                    setLoading(false);
                    localStorage.removeItem('authenticate');
                }
            } else {
                let message: string = 'Your account has been verified successfully. Now you can login and access your dashboard.';
                if(via && via === 'signup') message = 'Your account has been verified successfully.Once your account is approved you will be able to log in';
                showNotification('', message, 'success');
                setFormData(prevState => ({
                    ...prevState,
                    email: "",
                    code: ""
                }));
                setTimeout(() => {
                    router.push("/signin");
                }, 5000);
            }
    
        } catch (err) {
            const error = err instanceof Error ? err.message : "Something went wrong";
            showNotification('', error, 'error');
        } finally {
            setMainLoading(false);
        }
    };
    
    const handleResentCode = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/resend-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email:formData.email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Error while sending code");
            }
            showNotification(
                '',
                'Verification code sent successfully!', 
                'success'
            );
        } catch (err) {
            const error = err instanceof Error ? err.message : "Something went wrong";
            showNotification( 
                '',
                error, 
                'error'
            );
        }
    }
    return (
        <section className="login">
            <div className="container mx-auto">
                <div className="inner-login">
                    <div className="mob-col-reverse grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5">
                        <div className="card bg-white">
                            <div className="left-form-img">
                                <img src="images/banner/Hero-Banner-img.png" alt="" />
                            </div>
                        </div>
                        <div className="card card-bg-img bg-white">
                            <div className="right-form-content">
                                <div className="title">
                                    <h2>Account Verification</h2>
                                </div>
                                <div className="text">
                                    <p>Verify Your Account By Adding Verification Code Sent On Your Registered Email.</p>
                                </div>
                                <form className="login-form" onSubmit={handleSubmit}>
                                    <div className="form-fields-box">
                                        <div className="form-group">
                                            <input 
                                                type="text"
                                                id="" 
                                                className="form-control" 
                                                placeholder="Enter Your Code" 
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: e.target.value,
                                                    }))
                                                }
                                                name="code" 
                                            />
                                            {errors?.code && (
                                                <span className="text-red-500 text-sm">{errors.code}</span>
                                            )}
                                        </div>
                                    </div>
                                    {showResend && (
                                        <div className="flex items-center justify-between">
                                            <div className="resend-code">
                                                <a className="cursor-pointer" onClick={handleResentCode}>Resend Code</a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="login-btn">
                                        <button disabled={mainloading}  type="submit"><span>{mainloading ? 'Please wait' : 'Submit'}</span> <span><img src="images/arrows/maki_arrow.png" alt="" /></span></button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}