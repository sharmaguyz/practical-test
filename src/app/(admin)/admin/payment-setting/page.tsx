import type { Metadata } from "next";
import React from "react";
import PaymentSetting from "@/components/admin/payment-settings/PaymentSetting";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
    title: "Practical Academy | Settings",
    description: "Practical Academy | Settings",
};

export default function SettingForm(){
    return redirect('/admin/users');

      return (
        <>
            <PageBreadcrumb pageTitle="Setting Form" />
            <div className="grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <PaymentSetting/>
                </div>
            </div>
        </>
    )
}