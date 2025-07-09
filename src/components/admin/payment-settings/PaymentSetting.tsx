"use client";
import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Radio from "@/components/form/input/Radio";
import { useNotification } from '@/context/NotificationContext';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { API_BASE_URL } from "@/components/config/config";
export const paymentSettingSchema = z.object({
  stripeMode: z.enum(["sandbox", "live"], {
    required_error: "Please select a Stripe mode",
  }),
  stripe_secret: z
    .string()
    .nonempty("Stripe Secret is required")
    .min(20, "Stripe Secret must be at least 20 characters")
    .regex(/^sk_(live|test)_[a-zA-Z0-9]+$/, "Invalid Stripe Secret format"),
  stripe_webhook_secret: z
    .string()
    .nonempty("Stripe Webhook Secret is required")
    .min(10, "Stripe Webhook Secret must be at least 10 characters")
    .regex(/^whsec_[a-zA-Z0-9]+$/, "Invalid Stripe Webhook Secret format"),
  paypalmode: z.enum(["sandbox", "live"], {
    required_error: "Please select a PayPal mode",
  }),
  pay_pal_client_id: z
    .string()
    .nonempty("PayPal Client ID is required")
    .min(20, "PayPal Client ID must be at least 20 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid PayPal Client ID format"),
  pay_pal_secret: z
    .string()
    .nonempty("PayPal Secret is required")
    .min(20, "PayPal Secret must be at least 20 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid PayPal Secret format"),
});

type PaymentFormType = z.infer<typeof paymentSettingSchema>;

export default function PaymentSetting() {
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormType>({
    resolver: zodResolver(paymentSettingSchema),
    defaultValues: {
      stripeMode: "sandbox",
      stripe_secret: "",
      stripe_webhook_secret: "",
      paypalmode: "sandbox",
      pay_pal_client_id: "",
      pay_pal_secret: "",
    },
  });

  useEffect(() => {
    fetchSettings();
  }, [reset]);
 const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("Unauthorized action");
        }
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/payment-settings`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if (res.ok) {
          reset(data?.data?.data);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
        showNotification("","Failed to get settings.", "error");
      }
    };

  const onSubmit = async (values: PaymentFormType) => {
    setLoading(true);
    try {
        let url = `${API_BASE_URL}/api/v1/admin/create-setting`;
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("Unauthorized action");
        }
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(values),
        });
        const data = await response.json();
        if (response.ok) {
            fetchSettings();
            showNotification('',"Settings updated successfully.", "success");
        } else {
            showNotification(data.message || "Failed to update settings", "error");
        }
    } catch (err) {
      showNotification("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <ComponentCard title="" is_show_button={false} button_text="Back" button_link="/admin/users">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ComponentCard title="Stripe Setting">
              <div className="space-y-6">
                <div>
                  <Label>Mode</Label>
                  <Controller
                    name="stripeMode"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-4">
                        <Radio id="stripe_sandbox" name="stripeMode" value="sandbox" checked={field.value === "sandbox"} onChange={() => field.onChange("sandbox")} label="Sandbox" />
                        <Radio id="stripe_live" name="stripeMode" value="live" checked={field.value === "live"} onChange={() => field.onChange("live")} label="Live" />
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Label>Stripe Secret Key <span className="text-red-500">*</span></Label>
                  <input type="text" className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" {...register("stripe_secret")}/>
                {errors?.stripe_secret && (
                    <span className="text-red-500 text-sm">{errors.stripe_secret.message}</span>
                )}
                </div>
                <div>
                    <Label>Stripe Webhook Secret <span className="text-red-500">*</span></Label>
                    <input type="text" className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" {...register("stripe_webhook_secret")} />
                    {errors?.stripe_webhook_secret && (
                        <span className="text-red-500 text-sm">{errors.stripe_webhook_secret.message}</span>
                    )}
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="PayPal Setting">
              <div className="space-y-6">
                <div>
                  <Label>Mode</Label>
                  <Controller
                    name="paypalmode"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-4">
                        <Radio id="paypal_sandbox" name="paypalmode" value="sandbox" checked={field.value === "sandbox"} onChange={() => field.onChange("sandbox")} label="Sandbox" />
                        <Radio id="paypal_live" name="paypalmode" value="live" checked={field.value === "live"} onChange={() => field.onChange("live")} label="Live" />
                      </div>
                    )}
                  />
                </div>
                <div>
                    <Label>PayPal Client ID <span className="text-red-500">*</span></Label>
                    <input type="text" className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" {...register("pay_pal_client_id")} />
                    {errors?.pay_pal_client_id && (
                        <span className="text-red-500 text-sm">{errors.pay_pal_client_id.message}</span>
                    )}
                </div>
                <div>
                  <Label>PayPal Secret <span className="text-red-500">*</span></Label>
                  <input type="text" className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" {...register("pay_pal_secret")} />
                    {errors?.pay_pal_secret && (
                        <span className="text-red-500 text-sm">{errors.pay_pal_secret.message}</span>
                    )}
                </div>
              </div>
            </ComponentCard>
          </div>
          <Button size="sm" variant="primary" disabled={loading} className="mt-6">
            Submit
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}
