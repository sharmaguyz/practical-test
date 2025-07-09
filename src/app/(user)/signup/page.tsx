import UserSignUp from "@/components/auth/user/SignUp";
import { Metadata } from "next";
import "../css/register.css"

export const metadata: Metadata = {
  title: "User | Sign Up",
  description: "User | Sign Up",
};

export default function SignUp() {
  return <UserSignUp />
}
