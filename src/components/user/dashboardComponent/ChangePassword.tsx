"use client";
import { useState } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { useNotification } from '@/context/NotificationContext';
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/helpers/authHelper";
type Props = {
    show: number;
};
const ChangePassword = ({ show }: Props) => {
    const [formData, setFormData] = useState<{ oldPassword: string, newPassword: string, confirmPassword: string }>({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { showNotification } = useNotification();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        try {
            const { token, IdToken, AccessToken } = getLoggedInUser();
            const response = await fetch(`${API_BASE_URL}/api/v1/user/change-password`, {
                method: "POST",
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
            if(response.status == 404){
                return setErrors({ oldPassword:data.detail.message })
            }    
            if (!response.ok) {
                throw new Error(data.message || "Password Changed Failed!");
            }
            showNotification(
                '', 
                `Your password has been changed successfully!`, 
                'success'
            );
            (e.target as HTMLFormElement).reset();
            localStorage.removeItem("token");
            localStorage.removeItem("rolename");
            localStorage.removeItem('IdToken');
            localStorage.removeItem('AccessToken');
            localStorage.removeItem('RefreshToken');
            setTimeout(() => {
                return redirect('/signin');
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
        <form onSubmit={handleSubmit}>
            <div id="change-password-form" className={`${show === 4 ? "" : "hidden"}`}>
                <h2>Change Password</h2>
                <div>
                    <input
                        type="password"
                        name="oldPassword"
                        className="form-control"
                        placeholder="Old Password"
                        onChange={handleChange}
                    />
                    {errors?.oldPassword && (
                        <span className="text-red-500 text-sm">{errors.oldPassword}</span>
                    )}
                </div>
                <div>
                    <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        placeholder="New Password"
                        onChange={handleChange}
                    />
                    {errors?.newPassword && (
                        <span className="text-red-500 text-sm">{errors.newPassword}</span>
                    )}
                </div>
                <div>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm New Password"
                        onChange={handleChange}
                    />
                    {errors?.confirmPassword && (
                        <span className="text-red-500 text-sm">{errors.confirmPassword}</span>
                    )}
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Please wait" : "Submit"}</button>
            </div>
        </form>
    )
}
export default ChangePassword