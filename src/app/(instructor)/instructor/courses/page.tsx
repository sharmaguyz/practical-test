import { Metadata } from "next";
import CourseListPage from "@/components/instructor/CourseListPage";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
export const metadata: Metadata = {
    title: "Instructor | Course List",
    description: "Instructor | Course List",
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