"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/components/config/config';
import { getLoggedInUser } from "@/helpers/authHelper";
import Link from "next/link";
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
import { isStudentLoggedIn } from '@/helpers/commonHelper';
type CartItem = {
  courseId: string;
  courseName: string;
  courseImage: string;
  price: number;
  quantity: number;
  cartId:string
};
export default function CartPage(){
    const isLoggedIn = isStudentLoggedIn();
    if(!isLoggedIn) return; 
    const { showNotification } = useNotification();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { decrementCart, setCartCount } = useCart();
    const cartList = async() => {
      try {
        const { token, IdToken, AccessToken } = getLoggedInUser();
        const response = await fetch(`${API_BASE_URL}/api/v1/user/my-cart`, {
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
          setCartCount(item.length);
        } else {
          showNotification('', "Something went wrong while getting cart items.Please try after some time.", "error");
        }
      } catch (error) {
        console.log(error);
        showNotification('','Something went wrong while getting cart items.Please try after some time','error');
      } finally {
        setLoading(false);
      }
    }
    useEffect(() => {
      cartList();
    }, []);
    const getTotal = () => {
      return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };
    const handleDeleteItem = async(cartId : string) => {
      const { token, IdToken, AccessToken } = getLoggedInUser();
      try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/api/v1/user/delete-cart-item/${cartId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-ID-TOKEN": IdToken || "", 
              "X-ACCESS-TOKEN": AccessToken || "",
            }
          });
          if (response.ok) {
            showNotification('', "You cart item has been deleted successfully.", "success");
            cartList();
            decrementCart();
          } else {
            showNotification('', "Something went wrong while deleting cart items.Please try after some time.", "error");
          }
      } catch (error) {
        showNotification('', "Something went wrong while deleting cart item.Please try after some time.", "error");
      } finally {
        setLoading(false);
      }
    }
    const handleProceed = () => {
      router.push('/checkout');
      localStorage.removeItem('via');
    }
    return <>
  <div className="breadcrumbs">
    <div className="container mx-auto">
      <div className="inner-breadcrumbs">
        <nav
          className="flex card bg-white justify-between items-center"
          aria-label="Breadcrumb"
        >
          <div className="breadcrumbs-current-page">
            <h2>Cart</h2>
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
                  href="/courses"
                  className="inline-flex items-center text-sm font-medium text-gray-700 "
                >
                  Course
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
                <span className="ms-1 text-sm font-medium md:ms-2">Cart</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
  <section className="cart-outer-wrapper">
    <div className="container mx-auto">
      <div className="inner-cart-outer-wrapper">
        <div className="card bg-white">
          <div className="w-full mx-auto">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded overflow-hidden animate-pulse"
                  >
                    <div className="flex items-center p-4 space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-10 md:flex md:justify-end cart-total-table animate-pulse">
                  <div className="w-full md:w-1/2 lg:w-3/3">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <div className="w-24 h-4 bg-gray-200 rounded" />
                          <div className="w-16 h-4 bg-gray-200 rounded" />
                        </div>
                        <div className="flex justify-between">
                          <div className="w-24 h-4 bg-gray-300 rounded" />
                          <div className="w-16 h-4 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 h-10 w-60 bg-gray-300 rounded-full float-right" />
                  </div>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <p className="p-4 text-center">Your cart is empty.</p>
            ) : (
              <>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 font-semibold text-gray-800">
                      <tr>
                        <th className="p-3" />
                        <th className="p-3">Product</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={index} className="border-t border-gray-300">
                          <td className="p-3 !text-center text-red-600 text-lg cursor-pointer">
                            <button className="delete-cart-item" onClick={() => handleDeleteItem(item.cartId) }>
                              <i className="bx bx-x" />
                            </button>
                          </td>
                          <td className="p-3 flex items-center space-x-3">
                            <img src={item.courseImage || "/web/images/placeholder.png"} alt={item.courseName} className="w-12 h-12 object-cover rounded" />
                            <span>{item.courseName}</span>
                          </td>
                          <td className="p-3 font-medium">${item.price}.00</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {/* <button className="w-8 h-8 bg-gray-100 rounded">−</button> */}
                              <span>{item.quantity}</span>
                              {/* <button className="w-8 h-8 bg-gray-100 rounded">+</button> */}
                            </div>
                          </td>
                          <td className="p-3 font-medium">
                            ${(item.price * item.quantity)}.00
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* <div className="flex flex-wrap justify-between items-center p-4 border-t border-gray-300 bg-white">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        className="border border-gray-300 rounded px-4 py-2"
                      />
                      <button className="bg-purple-900 text-white px-4 py-2 rounded hover:bg-purple-800">
                        Apply coupon
                      </button>
                    </div>
                    <button
                      disabled={true}
                      className="bg-purple-900 text-white px-4 py-2 rounded hover:bg-purple-800 mt-2 md:mt-0 opacity-25"
                    >
                      Update cart
                    </button>
                  </div> */}
                </div>

                {/* Cart Totals */}
                <div className="mt-10 md:flex md:justify-end cart-total-table">
                  <div className="w-full md:w-1/2 lg:w-3/3">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Cart totals</h2>
                    <div className="border rounded border-gray-300 overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="p-4 font-semibold text-gray-800">Subtotal</td>
                            <td className="p-4 text-right text-gray-700">${getTotal()}.00</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-bold text-gray-900">Total</td>
                            <td className="p-4 text-right font-bold text-gray-900">${getTotal()}.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <button onClick={() => handleProceed()} className="w-60 mt-4 bg-purple-900 text-white font-semibold py-3 rounded-full hover:bg-purple-800 float-right">
                      Proceed to checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
</>

}