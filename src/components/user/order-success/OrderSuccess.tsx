"use client";
import Link from "next/link";
import { useState, useEffect} from "react";
import { API_BASE_URL } from "@/components/config/config";
import { getLoggedInUser } from "@/helpers/authHelper";
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
type Courses = {
  courseName: string;
  courseImage: string;
  price: number
}
export default function OrderSuccess(){
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [courses, setCourses] = useState<Courses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();
  const router = useRouter();
  const { setCartCount } = useCart();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    const paymenttype = params.get("type");
    const token = params.get("token");
    if (!sid || sid.trim() === "") {
      router.push("/dashboard");
      return;
    }
    setSessionId(sid);
    if(paymenttype == 'paypal'){
      setSessionId(token);
    }
    setType(paymenttype);
  }, [router]);
  useEffect(() => {
    if (!sessionId) return;
    const getPlacedOrder = async () => {
      try {
        const url = `${API_BASE_URL}/api/v1/order/placed-order?sessionId=${sessionId}&type=${type}`;
        const { token, IdToken, AccessToken } = getLoggedInUser();
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-ID-TOKEN": IdToken || "",
            "X-ACCESS-TOKEN": AccessToken || "",
          },
        });
        const data = await response.json();
        if(response.status == 500){
          showNotification("", "Invalid order or something went wrong.", "error");
          router.push("/dashboard");
        }
        setCourses(data.data.courses || []);
        setCartCount(0);
      } catch (err) {
        console.error("Failed to fetch placed order:", err);
        showNotification("", "Invalid order or something went wrong.", "error");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    getPlacedOrder();
  }, [sessionId, router]);
  const totalPaid = courses.reduce((sum, c) => sum + c.price, 0);
  if (loading) {
    return (
      <section className="order-success-wrapper">
        <div className="container mx-auto p-6 text-center">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-6"></div>

            {/* Skeleton for course list */}
            {[1, 2].map((_, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 mb-4 border-b border-gray-300 pb-4"
              >
                <div className="w-20 h-24 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))}

            {/* Skeleton for total price */}
            <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto mt-6"></div>
          </div>
        </div>
      </section>
    );
  }
  return <section className="order-success-wrapper">
  <div className="container mx-auto">
    <div className="inner-order-success-wrapper">
      <div className="card bg-white">
        <div className="max-w-3xl mx-auto p-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 text-green-600 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2 success-title">
            Thank You! Your Order Was Successful 🎉
          </h1>
          <p className="text-gray-600 mb-6 text-base">
            We've emailed your order confirmation. You can now access your
            course content below.
          </p>
          {/* Order Summary */}
          <div className="border border-gray-300 rounded-lg overflow-hidden text-left">
            <div className="bg-gray-100 px-6 py-3 font-semibold text-gray-700">
              Order Summary
            </div>
            <div className="p-6 space-y-4">
              {courses.map((c,idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <img
                    src={c.courseImage}
                    alt="Course Thumbnail"
                    className="w-20 h-24 object-cover rounded border border-gray-300"
                  />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {c.courseName}
                    </h3>
                    <p className="text-sm text-gray-500 text-base">Quantity: 1</p>
                    <p className="text-sm text-gray-500 text-base">
                      Price: ${c.price}.00
                    </p>
                    <Link
                      href="/dashboard"
                      className="mt-2 inline-block text-purple-900 font-medium hover:underline"
                    >
                      Go to My Dashboard  →
                    </Link>
                  </div>
                </div>
              ))}
             
              {/* Add more courses here if multiple were purchased */}
              {/* Total */}
              <div className="border-t border-gray-300 pt-4 mt-4 text-right font-bold text-black">
                Total Paid: ${totalPaid.toFixed(2)}
              </div>
            </div>
          </div>
          {/* Go to Dashboard */}
          {/* <Link
            href="/dashboard"
            className="mt-8 inline-block bg-purple-900 text-white px-6 py-3 rounded-full hover:bg-purple-800 transition"
          >
            Go to My Courses
          </Link> */}
        </div>
      </div>
    </div>
  </div>
</section>

}