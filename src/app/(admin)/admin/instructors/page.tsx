import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Metadata } from "next";
import React from "react";
import InstructorListing from "@/components/admin/InstructorListing";

export const metadata: Metadata = {
  title: "Instructors List | Practical Academy",
  description: "Practical Academy",
};

export default function UserList() {
  return (
      <>
        <PageBreadcrumb pageTitle="Instructors" />
        <div className="space-y-6 left--card--inner">
          <ComponentCard title="" is_show_button={false} button_text="Add Instructor" button_link="/admin/instructors/add-form">
            <InstructorListing />
          </ComponentCard>
        </div>
      </>
  )
}