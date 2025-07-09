import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practical Academy | Forgot Password",
  description: "Practical Academy | Forgot Password",
};
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
export default function ForgotPassword(){
  return <ForgotPasswordForm/>
}