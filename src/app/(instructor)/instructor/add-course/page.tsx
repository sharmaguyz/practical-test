import { Metadata } from "next";
import AddCourseForm from "@/components/instructor/AddCourse";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
    title: "Instructor | Add Course",
    description: "Instructor | Add Course",
};

export default function AddCourse() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Course" />
            <div className="">
                <div className="space-y-6">
                    <AddCourseForm />
                </div>
            </div>
        </div>
    )
}