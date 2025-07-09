import { Metadata } from "next";
import CourseDetailPage from "@/components/user/course/CourseDetailPage";
export const metadata: Metadata = {
    title: "Practical Academy | Course Detail",
    description: "Practical Academy | Course Detail",
};
interface PageProps {
    params: Promise<{ id: string | number }>;
}
export default async function CourseDetail(props: PageProps){
    const params = await props.params;
    const { id } = params;
    return (
        <CourseDetailPage id={id}/>
    )
}