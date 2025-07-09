"use client";
import React, { useState } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { useNotification } from '@/context/NotificationContext';
export default function ForgotPasswordForm() {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const [formData, setFormData] = useState<{ email: string }>({ email: "" });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/forgot-password`, {
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
        showNotification(
          'Error.',
          data.message,
          'error'
        );
      } else {
        const message = data.data.message;
        showNotification(
          '',
          message,
          'success'
        );
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.log(err instanceof Error ? err.message : "Something went wrong");
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
                  <h2>Forgot Password</h2>
                </div>
                <div className="text">
                  <p>
                    Enter your e-mail address, and we'll give you reset instruction.
                  </p>
                </div>
                <form className="forgot-password-form" onSubmit={handleSubmit}>
                  <div className="form-fields-box">
                    <div className="form-group">
                      <input
                        type="text"
                        name="email"
                        id=""
                        className="form-control"
                        placeholder="Enter Your Email"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev) => ({
                            ...prev,
                            [e.target.name]: e.target.value
                          }))
                        }
                      />
                      {errors?.email && (
                        <span className="text-red-500 text-sm">{errors.email}</span>
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