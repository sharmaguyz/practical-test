import type { Metadata } from "next";
import React from "react";
import CourseListPage from "@/components/admin/CourseListPage";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
export const metadata: Metadata = {
  title: "Practical Academy | CourseList",
  description: "Practical Academy",
};

export default function CourseList() {
    return (
        <>
          <PageBreadcrumb pageTitle="Courses" />
          <div className="space-y-6 left--card--inner">
            <ComponentCard title="">
              <CourseListPage />
            </ComponentCard>
          </div>
        </>
    )
}
