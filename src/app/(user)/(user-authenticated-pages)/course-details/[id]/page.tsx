import { Metadata } from "next";
import StudentCourseDetailPage from "@/components/user/course/StudentCourseDetail";
export const metadata: Metadata = {
    title: "Practical Academy | Course Detail",
    description: "Practical Academy | Course Detail",
};
interface PageProps {
    params: Promise<{ id: string | number }>;
}
export default async function StudentCourseDetail(props: PageProps){
    const params = await props.params;
    const { id } = params;
    return (
        <StudentCourseDetailPage id={id}/>
    )
}