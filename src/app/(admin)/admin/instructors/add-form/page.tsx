import type { Metadata } from "next";
import InstructorForm from "@/components/auth/admin/instructoForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
export const metadata: Metadata = {
    title: "Instructors Add Form | Practical Academy",
    description: "Practical Academy",
};

export default function AddInstructorForm() {
    return (
        <>
            <PageBreadcrumb pageTitle="Instructor Form" />
            <div className="grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <InstructorForm/>
                </div>
            </div>
        </>
    )
}