"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useContext } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/alert/Alert";
import { useLoading } from '@/context/LoadingContext';
import { useAuth } from "@/context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {setAuth} = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState<{ email:string,password:string }>({ email: "",password:"" });
  const [loading, setButtonLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const router = useRouter();
  const [successMessage,setSuccessMessage] = useState<string>("");
  const [errorMessage,setErrorMessage] = useState<string>("");
  const { setLoading } = useLoading();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonLoading(true);
    setErrors(null);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        // credentials:'include'
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
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem('token',data.token);
      localStorage.setItem('rolename',data.role);
      setLoading(true);
      setAuth(data.role, data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setButtonLoading(false);
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
            {errorMessage && ( 
              <Alert
                variant="error"
                title="Warning Message"
                message={errorMessage}
                showLink={false}
            />)}
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input  
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }))
                    }
                    name="email" 
                    placeholder="info@gmail.com" 
                    type="email" 
                  />
                  {errors?.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev) => ({
                          ...prev,
                          [e.target.name]: e.target.value,
                        }))
                      }
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                  {errors?.password && (
                      <span className="text-red-500 text-sm">{errors.password}</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={(e) => setIsChecked(typeof e === "boolean" ? e : e.target.checked)} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/admin/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button disabled={loading ? true : false} className="w-full" size="sm">
                    {loading ? 'Please wait' : ' Sign in'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
