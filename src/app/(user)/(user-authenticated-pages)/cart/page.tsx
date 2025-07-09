import { Metadata } from "next";
import CartPage from "@/components/user/cart/CartPage";
export const metadata: Metadata = {
  title: "Practical Academy | Cart",
  description: "Practical Academy | Cart",
};

export default function Cart(){
  return <CartPage/>
}