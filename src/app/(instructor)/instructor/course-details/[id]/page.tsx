import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import InstructorCourseDetailPage from "@/components/instructor/InstructorCourseDetailPage";
export const metadata: Metadata = {
  title: "Practical Academy | Course Details",
  description: "Practical Academy | Course Details",
};
interface PageProps {
    params: Promise<{ id: string | number }>;
}
export default async function InstructorCourseDetails(props: PageProps){
    const params = await props.params;
    const { id } = params;
    return (
        <div>
            <PageBreadcrumb pageTitle="Course Details" />
            <div className="space-y-6 left--card--inner">
                <ComponentCard title="">
                    <InstructorCourseDetailPage id={id} />
                </ComponentCard>
            </div>
        </div>
    )
} 