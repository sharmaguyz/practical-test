import type { Metadata } from "next";
import React from "react";
import PurchasedCourseListing from "@/components/admin/PurchasedCourseListing";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
export const metadata: Metadata = {
  title: "Practical Academy | Purchased CourseList",
  description: "Practical Academy",
};

export default function PurchasedCourseList() {
    return (
        <>
          <PageBreadcrumb pageTitle="Purchased Courses" />
          <div className="space-y-6 left--card--inner">
            <ComponentCard title="">
              <PurchasedCourseListing />
            </ComponentCard>
          </div>
        </>
    )
}