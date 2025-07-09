
import { Metadata } from "next";
import TermsAndConditionPage from "@/components/guest/TermsAndConditions";
export const metadata: Metadata = {
  title: "Practical Academy | Terms and condition Page",
  description: "Practical Academy | Terms and condition Page",
};

export default function ContactUs() {
  return <TermsAndConditionPage/>;
}
