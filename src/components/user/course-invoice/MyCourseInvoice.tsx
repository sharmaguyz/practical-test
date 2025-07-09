"use client";
import { useState, useEffect } from "react";
import { fetchData } from "@/helpers/apiHelper";
import { API_BASE_URL } from "@/components/config/config";
import { getLoggedInUser } from "@/helpers/authHelper";
import Link from "next/link";
type InvoiceProps = {
  orderId: string | number;
  courseId: string | number;
};
export interface InvoiceOrder {
  id: string;
  createdAt: string;
  paymentMode: string;
};
export interface InvoiceUser {
  fullName: string;
  email: string;
  phone: string;
};
export interface InvoiceCourse {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  startDate: string;
  endDate: string;
  instructorName: string;
};
export interface InvoiceData {
  order: InvoiceOrder;
  user: InvoiceUser;
  course: InvoiceCourse;
}
export default function MyCourseInvoicePage({ orderId, courseId }: InvoiceProps) {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { token, IdToken, AccessToken } = getLoggedInUser();
        if (!token) {
          return;
        }
        const response: any = await fetchData(
          `${API_BASE_URL}/api/v1/user/course-invoice/${orderId}/${courseId}`, token, IdToken, AccessToken
        );
        if (response.data?.data?.result?.success) {
          setData(response.data?.data?.result?.data);
        }
      } catch (error) {
        console.error('Invoice fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [orderId, courseId]);
  if (loading) {
    return (
      <>
        <div className="breadcrumbs">
          <div className="container mx-auto">
            <div className="inner-breadcrumbs">
              <nav className="flex card bg-white justify-between items-center" aria-label="Breadcrumb">
                <div className="breadcrumbs-current-page">
                  <h2>Course Invoice</h2>
                </div>
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                  <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 "> Home </Link>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="rtl:rotate-180  w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                      </svg>
                      <span className="ms-1 text-sm font-medium md:ms-2">My Course</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="container mt-3">
          <div className="bg-white rounded shadow p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 bg-gray-200 rounded w-2/3 ml-auto" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto" />
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mt-8" />
              <div className="h-32 bg-gray-100 rounded mt-2" />
            </div>
          </div>
        </div>
      </>
    );
  }
  if (!data) return <div className="text-red-500">Invoice not found.</div>;

  const { user, order, course } = data;
  return (
    <>
      <div className="breadcrumbs">
        <div className="container mx-auto">
          <div className="inner-breadcrumbs">
            <nav className="flex card bg-white justify-between items-center" aria-label="Breadcrumb">
              <div className="breadcrumbs-current-page">
                <h2>Course Invoice</h2>
              </div>
              <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 "> Home </Link>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="rtl:rotate-180  w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                    </svg>
                    <span className="ms-1 text-sm font-medium md:ms-2">My Course</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <div className="container mt-3">
        <div className="bg-white rounded shadow p-6">
          <div className="text-center mb-6">
            <div className="text-lg font-semibold">Practical Academy</div>
            <div className="text-gray-600">www.practical-academy.com</div>
            <div className="text-gray-600">support@practical-academy.com</div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <div className="w-full sm:w-1/2">
              <div className="font-semibold text-gray-900 mb-2">
                Student Information
              </div>
              <div><span className="font-medium">Name:</span> {user.fullName}</div>
              <div><span className="font-medium">Email:</span> {user.email}</div>
              <div><span className="font-medium">Phone:</span> {user.phone}</div>
              <div><span className="font-medium">Payment Mode:</span> {order.paymentMode.charAt(0).toUpperCase() + order.paymentMode.slice(1)}</div>
            </div>
            <div className="w-full sm:w-1/2 text-right">
              <div className="font-semibold text-gray-900 mb-2">Invoice Details</div>
              <div><span className="font-medium">Invoice:</span> {`INV-${order.id}`}</div>
              <div><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="mt-8">
            <div className="font-semibold text-gray-900 border-b pb-1 mb-2">
              Course Details
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2">S.No.</th>
                    <th className="border border-gray-300 px-3 py-2">Course Name</th>
                    <th className="border border-gray-300 px-3 py-2">Start Date</th>
                    <th className="border border-gray-300 px-3 py-2">End Date</th>
                    <th className="border border-gray-300 px-3 py-2">Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">1</td>
                    <td className="border border-gray-300 px-3 py-2">{course.name}</td>
                    <td className="border border-gray-300 px-3 py-2">{course.startDate || 'N/A'}</td>
                    <td className="border border-gray-300 px-3 py-2">{course.endDate || 'N/A'}</td>
                    <td className="border border-gray-300 px-3 py-2">${course.price.toLocaleString()}.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">Total</td>
                    <td className="border border-gray-300 px-3 py-2">${course.price.toLocaleString()}.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs mt-10">
            This is a computer-generated invoice. No signature required.
            <br />
            Thank you for choosing Practical Academy!
          </div>
        </div>
      </div>
    </>
  );

}