import { Metadata } from "next";
import "@/app/(user)/css/instructor.css";
import InstructorSignUp from "@/components/auth/instructor/SignUp";

export const metadata: Metadata = {
  title: "Instructor | Sign Up",
  description: "Instructor | Sign Up",
};

export default function SignUp() {
  return <InstructorSignUp/>
}
