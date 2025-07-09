
import { Metadata } from "next";
import AboutUsPage from "@/components/guest/AboutUs";
export const metadata: Metadata = {
  title: "Practical Academy | About Us Page",
  description: "Practical Academy | About Us Page",
};

export default function ContactUs() {
  return <AboutUsPage/>;
}
