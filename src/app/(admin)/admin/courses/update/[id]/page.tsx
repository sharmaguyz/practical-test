import type { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditCourseForm from "../components/EditCourseForm";

export const metadata: Metadata = {
    title: "Update Course | Practical Academy",
    description: "Practical Academy",
};

interface PageProps {
    params: Promise<{ id: string | number }>;
}

export default async function UpdateCourse(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    return (
        <>
            <PageBreadcrumb pageTitle="Update Course" />
            <div className="">
                <div className="space-y-6">
                    <EditCourseForm id={id} />
                </div>
            </div>
        </>
    )
}