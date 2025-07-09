import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CourseInvoice from "@/components/admin/CourseInvoice";

export const metadata: Metadata = {
  title: "Practical Academy | Course Invoice",
  description: "Practical Academy | Course Invoice",
};

interface PageProps {
  params: Promise<{ orderId: string; courseId: string }>;
}

export default async function Invoice(props: PageProps) {
  const params = await props.params;
  const { orderId, courseId } = params;
  return (
    <>
      <PageBreadcrumb pageTitle="Course Invoice" />
      <div className="space-y-6 left--card--inner">
        <ComponentCard title="">
          <CourseInvoice orderId={orderId} courseId={courseId} />
        </ComponentCard>
      </div>
    </>
  );
}