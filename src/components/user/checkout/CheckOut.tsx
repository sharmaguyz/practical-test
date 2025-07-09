"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/components/config/config';
import { getLoggedInUser } from "@/helpers/authHelper";
import Link from "next/link";
import { useNotification } from '@/context/NotificationContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isStudentLoggedIn } from "@/helpers/commonHelper";
import LoadingButton from "@/components/form/LoadingButton";
import { useRouter } from "next/navigation";
type CartItem = {
  courseId: string;
  courseName: string;
  courseImage: string;
  price: number;
  quantity: number;
  cartId: string;
};
const studentSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .nullable()
    .or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  address: z.string().trim().min(1, 'Address is required'),
  zip_code: z.string().trim().min(1, 'ZIP Code is required'),
  payment_method: z.enum(['paypal', 'stripe'], {
    errorMap: () => ({ message: 'Payment method is required' }),
  }),
});

type Student = z.infer<typeof studentSchema>;
export default function CheckOutPage(){
    const { showNotification } = useNotification();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<Student | null>(null);
    const loggedinStatus = isStudentLoggedIn();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();
    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    } = useForm<Student>({
      resolver: zodResolver(studentSchema),
      defaultValues: {
        fullName: '',
        email: '',
        phoneNumber: '',
        city: '',
        address: '',
        zip_code: '',
        payment_method: undefined, 
      },
    });
    const cartList = async() => {
      try {
        setLoading(true);
        const via = JSON.parse(localStorage.getItem("via") || '{}');
        let url = `${API_BASE_URL}/api/v1/user/my-cart`;
        if(via.detail){
          url = `${API_BASE_URL}/api/v1/user/my-cart?courseId=${via.courseId}`;
        }
        const { token, IdToken, AccessToken } = getLoggedInUser();
        const response = await fetch(`${url}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-ID-TOKEN": IdToken || "", 
            "X-ACCESS-TOKEN": AccessToken || "",
          }
        });
        const data = await response.json();
        if (response.ok) {
          const item = data.data.items;
          setCartItems(Array.isArray(item) ? item : [item]);
          let userDataToUse: Student;
          if (data?.data?.billingAddress && Object.keys(data.data.billingAddress).length > 0) {
            userDataToUse = {
              ...data.data.billingAddress,
              address: data.data.billingAddress.address?.trim() || '',
              zip_code: data.data.billingAddress.zipCode?.trim() || '',
              payment_method: undefined as any,
            };
          } else {
            userDataToUse = {
              ...data.data.data,
              address: data.data.data.address?.trim() || '',
              zip_code: data.data.data.zip_code?.trim() || '',
              payment_method: undefined as any,
            };
          }
          if(item.length == 0){
            showNotification('','Please select at least one course before proceeding to checkout.','error');
            setTimeout(() => {
              window.location.href = '/courses';
            },500);
            return;
          }else{
            setUserData(userDataToUse);
            reset(userDataToUse);
          }
        } else {
          showNotification('', "Something went wrong while getting your order items.Please try after some time.", "error");
        }
      } catch (error) {
        console.log(error);
        showNotification('','Something went wrong while getting your order items.Please try after some time','error');
      } finally {
        setLoading(false);
      }
    }
    useEffect(() => { 
      if(loggedinStatus) cartList();
      return;
    }, []);
    const getTotal = () => {
      return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };
    const onSubmit = async (data: Student) => {
      try {
        setIsSubmitting(true);
        const payload = {
          ...data,
          cart_items: cartItems.map(item => ({
            course_id: item.courseId,
            quantity: item.quantity,
            price: item.price,
            courseName: item.courseName
          })),
          totalAmount: getTotal()
        };
        const { token, IdToken, AccessToken } = getLoggedInUser();
        const response = await fetch(`${API_BASE_URL}/api/v1/order/place-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-ID-TOKEN': IdToken || '',
            'X-ACCESS-TOKEN': AccessToken || '',
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok && result.data.url) {
          const via = JSON.parse(localStorage.getItem("via") || '{}');
          if(via){
            localStorage.removeItem('via');
          }
          window.location.href = result.data.url;
        } else {
          showNotification('', result.detail.message || 'Failed to initiate payment.', 'error');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        showNotification('', 'An error occurred during checkout.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return <>
  <div className="breadcrumbs">
    <div className="container mx-auto">
      <div className="inner-breadcrumbs">
        <nav
          className="flex card bg-white justify-between items-center"
          aria-label="Breadcrumb"
        >
          <div className="breadcrumbs-current-page">
            <h2>Checkout</h2>
          </div>
          <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 "
              >
                Home
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="rtl:rotate-180  w-3 h-3 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <Link
                  href="/cart"
                  className="inline-flex items-center text-sm font-medium text-gray-700 "
                >
                  Cart
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="rtl:rotate-180  w-3 h-3 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="ms-1 text-sm font-medium md:ms-2">
                  Checkout
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
  <section className="checkout-outer-wrapper">
    <div className="container mx-auto">
      <div className="inner-checkout-outer-wrapper">
        <div className="card bg-white">
          <div className="w-full mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-2">Billing Details</h3>
                  <p className="text-md text-gray-500 font-normal mb-6">
                    Enter the billing address that matches your payment method.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium text-black text-sm">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={userData?.fullName ?? ''}
                        {...register('fullName')}
                        className="w-full border rounded px-4 py-4 text-sm border-gray-300"
                      />
                      {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium text-black text-sm">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={userData?.email ?? ''}
                        {...register('email')}
                        className="w-full border rounded px-4 py-4 text-sm border-gray-300"
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium text-black text-sm">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={userData?.phoneNumber ?? ''}
                        {...register('phoneNumber')}
                        className="w-full border rounded px-4 py-4 text-sm border-gray-300"
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium text-black text-sm">
                        Address
                      </label>
                      <input
                        type="text"
                        // defaultValue={userData?.address ?? ''}
                        {...register('address')}
                        className="w-full border rounded px-4 py-4 text-sm border-gray-300"
                      />
                      {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 font-medium text-black text-sm">
                          City
                        </label>
                        <input
                          type="text"
                          defaultValue={userData?.city ?? ''}
                          {...register('city')}
                          className="w-full border rounded px-4 py-4 text-sm border-gray-300"
                        />
                        {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block mb-1 font-medium text-black text-sm">
                          ZIP/Postal
                        </label>
                        <input
                          type="text"
                          {...register('zip_code')}
                          // defaultValue={userData?.zip_code ?? ''}
                          className="w-full border rounded px-4 py-4 text-sm border-gray-300"
                        />
                        {errors.zip_code && <p className="text-red-500 text-sm">{errors.zip_code.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Order Summary */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Your Order</h3>
                  <div className="border border-gray-300 rounded bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left font-semibold">Product</th>
                          <th className="p-3 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item,index) => (
                          <tr key={index} className="border-t border-gray-300 text-gray-700">
                            <td className="p-3 flex items-center space-x-3">
                              <img
                                src={item.courseImage}
                                alt="Product"
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span>{item.courseName} × {item.quantity}</span>
                            </td>
                            <td className="p-3 text-right">${item.price}.00</td>
                          </tr>
                        ))}
                        <tr className="border-t border-gray-300 font-bold">
                          <td className="p-3">Subtotal</td>
                          <td className="p-3 text-right">${getTotal()}.00</td>
                        </tr>
                        <tr className="border-t border-gray-300 font-bold">
                          <td className="p-3">Total</td>
                          <td className="p-3 text-right">${getTotal()}.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Payment Options */}
                  <div className="pt-6 pb-4 space-y-3 payment-method">
                    <h4 className="font-semibold text-gray-800">
                      Payment Method
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="paypal"
                          {...register('payment_method')}   
                          className="accent-purple-900"
                          defaultChecked={false}
                        />
                        <i className="bx bxl-paypal text-blue-700 text-xl"></i>
                        <span>Paypal</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="stripe"
                          {...register('payment_method')}
                          className="accent-purple-900"
                        />
                        <i className="bx bxl-stripe text-purple-700 text-xl"></i>
                        <span>Stripe</span>
                      </label>
                      {errors.payment_method && (
                        <p className="text-red-500 text-sm">{errors.payment_method.message}</p>
                      )}
                    </div>
                  </div>
                  {/* Place Order Button */}
                  <LoadingButton
                    isLoading={isSubmitting}
                    type="submit"
                    className="mt-6 w-full bg-purple-900 text-white py-3 rounded-full text-lg font-semibold hover:bg-purple-800"
                    >
                    Place Order
                  </LoadingButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</>
}