import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Metadata } from "next";
import React from "react";
import UserListing from "@/components/admin/UserListing";

export const metadata: Metadata = {
  title: "UserList | Practical Academy",
  description: "Practical Academy",
};

export default function UserList() {
  return (
      <>
        <PageBreadcrumb pageTitle="Students" />
        <div className="space-y-6 left--card--inner">
          <ComponentCard title="" is_show_button={false} button_text="Add Student" button_link="/admin/user/add">
            <UserListing/>
          </ComponentCard>
        </div>
      </>
  )
}