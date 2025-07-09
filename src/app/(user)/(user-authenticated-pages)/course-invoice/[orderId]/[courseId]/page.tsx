import { Metadata } from "next";
import MyCourseInvoicePage from "@/components/user/course-invoice/MyCourseInvoice";
export const metadata: Metadata = {
  title: "Practical Academy | Course Invoice",
  description: "Practical Academy | Course Invoice",
};
interface PageProps {
  params: Promise<{ orderId: string; courseId: string }>;
}
export default async function MyInvoiceDetail(props: PageProps){
    const params = await props.params;
    const { orderId, courseId } = params;
    return <MyCourseInvoicePage orderId={orderId} courseId={courseId}/>
}