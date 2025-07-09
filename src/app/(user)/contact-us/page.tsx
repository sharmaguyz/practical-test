
import { Metadata } from "next";
import ContactUsPage from "@/components/guest/ContactUs";
export const metadata: Metadata = {
  title: "Practical Academy | Contact Us Page",
  description: "Practical Academy | Contact Us Page",
};

export default function ContactUs() {
  return <ContactUsPage/>;
}
