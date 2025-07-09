import UserSignIn from "@/components/auth/common/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User | Sign In",
  description: "User | Sign In",
};

export default function SignIn() {
  return <UserSignIn />;
}
