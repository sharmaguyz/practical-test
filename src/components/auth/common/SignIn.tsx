"use client";
import Link from "next/link"
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { redirect, useRouter } from "next/navigation";
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from "@/context/AuthContext";
type ViaData = {
  detail: boolean;
  courseId: string;
};
export default function UserSignIn() {
    const [isChecked, setIsChecked] = useState(false);
    const [formData, setFormData] = useState<{ email: string, password: string ,isChecked: boolean,courseId: string | null}>({ email: "", password: "" ,isChecked:false, courseId:null});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const router = useRouter();
    const { showNotification } = useNotification();
    const { setAuth } = useAuth();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        try {
            if(localStorage.getItem("courseId") && formData.courseId === null){
                setFormData((prev) => ({
                    ...prev,
                    courseId:localStorage.getItem("courseId") ,
                }));
            }
            const response = await fetch(`${API_BASE_URL}/api/v1/user/signin`, {
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
            if(response.status === 403){
                const { isAuth } = data?.detail;
                if(isAuth){
                    localStorage.setItem('authenticate',btoa(formData.password));
                }
            }
            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }
            const hasSeen = localStorage.getItem("hasSeenLoginSuccess");
            if (hasSeen !== 'true') {
                showNotification(
                    '',
                    `You have successfully logged in. Welcome to your dashboard!`,
                    'success'
                );
                localStorage.setItem('hasSeenLoginSuccess', 'true');
            }
            if(response.status == 400){
                showNotification(
                    '',
                    `Please log in with student credentials.`,
                    'error'
                );
                setFormData((prev) => ({
                    ...prev,
                    courseId: null,
                }));
                return;
            }
            localStorage.setItem('token',data.data.token);
            localStorage.setItem('rolename',data.data.role.name);
            localStorage.setItem('IdToken',data.data.IdToken);
            localStorage.setItem('AccessToken',data.data.AccessToken);
            localStorage.setItem('RefreshToken',data.data.RefreshToken);
            localStorage.setItem('id',data.data.id);
            setAuth(data.data.role.name, data.data.token);
            if(data.data.role.name === "INSTRUCTOR"){
                localStorage.removeItem("courseId");
                return router.push("/instructor/dashboard");
            } else if (data?.data?.role?.name === "STUDENT") {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("courseId");
                    let via: ViaData | null = null;
                    const viaStr = localStorage.getItem("via");
                    if (viaStr) {
                        try {
                            via = JSON.parse(viaStr) as ViaData;
                        } catch (error) {
                            console.error("Failed to parse 'via' from localStorage", error);
                        }
                    }
                    if (via?.detail) {
                        window.location.href = "/checkout";
                    } else {
                        window.location.href = "/dashboard";
                    }
                }
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : "Something went wrong";
            showNotification(
                '', 
                error, 
                'error'
            );
            if(error == 'Your account has not been verified yet!.Please verify your account.' || error == 'Your account has not been verified yet. A new verification code has been sent to your email.'){
                setTimeout(() => {
                    const encodedEmail = encodeURIComponent(formData.email);
                    redirect(`/account-verify?email=${encodedEmail}&via=signin`);
                }, 5000);
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if(localStorage.getItem("courseId")){
            setFormData((prev) => ({
                ...prev,
                courseId:localStorage.getItem("courseId") ,
            }));
        }
    }, []);
    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setIsChecked(checked);
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
    };
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
                                    <h2>Login</h2>
                                </div>
                                <div className="text">
                                    <p>Log in to your account.</p>
                                </div>
                                <form className="login-form" onSubmit={handleSubmit}>
                                    <div className="form-fields-box">
                                        <div className="form-group">
                                            <input 
                                                type="text"
                                                id="" 
                                                className="form-control" 
                                                placeholder="Enter Your Email" 
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: e.target.value,
                                                    }))
                                                }
                                                name="email" 
                                            />
                                            {errors?.email && (
                                                <span className="text-red-500 text-sm">{errors.email}</span>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <input type="password" 
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: e.target.value,
                                                    }))
                                                }
                                                id="" 
                                                name="password"
                                                className="form-control" 
                                                placeholder="Enter Your Password" 
                                            />
                                            {errors?.password && (
                                                <span className="text-red-500 text-sm">{errors.password}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="remember-field">
                                            <label>
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked} 
                                                name="isChecked"  
                                                onChange={handleCheckbox} 
                                                id="" 
                                            />Remember Me
                                            </label>
                                        </div>
                                        <div className="forgot-pass">
                                            <Link href="/forgot-password">Forgot Password</Link>
                                        </div>
                                    </div>
                                    <div className="login-btn">
                                        <button disabled={loading}  type="submit"><span>{loading ? 'Please wait' : ' Log In'}</span> <span><img src="images/arrows/maki_arrow.png" alt="" /></span></button>
                                    </div>
                                    <div className="register-info">
                                        <p>Don't have an account <Link href="/signup">Register Now</Link></p>
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