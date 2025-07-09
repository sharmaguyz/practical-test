import { Metadata } from "next";
import AccountVerifyForm from "@/components/auth/common/AccountVerifyForm";
export const metadata: Metadata = {
  title: "Practical Academy | Account Verification",
  description: "Practical Academy | Account Verification",
};

export default function ContactUs() {
  return <AccountVerifyForm/>;
}