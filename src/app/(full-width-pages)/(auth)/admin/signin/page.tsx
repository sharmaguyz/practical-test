import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practical Academy | Sign In",
  description: "Practical Academy | Sign In",
};

export default function SignIn() {
  return <SignInForm />;
}
