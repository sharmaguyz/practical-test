import { Metadata } from "next";
import EditCourseForm from "@/components/instructor/EditCourse";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
    title: "Practical Academy | Edit Course",
    description: "Practical Academy | Edit Course",
};
interface PageProps {
    params: Promise<{ id: string | number }>;
}
export default async function EditCourse(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Course" />
            <div className="">
                <div className="space-y-6">
                    <EditCourseForm id={id}/>
                </div>
            </div>
        </div>
    )
}