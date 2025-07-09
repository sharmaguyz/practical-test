import { Metadata } from "next";
import CheckOutPage from "@/components/user/checkout/CheckOut";
export const metadata: Metadata = {
  title: "Practical Academy | Checkout",
  description: "Practical Academy | Checkout",
};

export default function CheckOut(){
  return <CheckOutPage/>
}