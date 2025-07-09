import { Metadata } from "next";
import OrderSuccess from "@/components/user/order-success/OrderSuccess";
export const metadata: Metadata = {
  title: "Practical Academy | Order Success",
  description: "Practical Academy | Order Success",
};

export default function ContactUs() {
  return <OrderSuccess/>;
}