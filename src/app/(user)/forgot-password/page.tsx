import { Metadata } from "next";
import "@/assets/css/style.css"
import ForgotPasswordForm from "@/components/auth/common/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "User | Forgot Password",
  description: "User | Forgot Password",
};

export default function SignUp() {
  return <ForgotPasswordForm/>
}
