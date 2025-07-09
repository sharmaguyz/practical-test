
import { Metadata } from "next";
import HomePage from "@/components/guest/Home";
export const metadata: Metadata = {
  title: "Practical Academy | Home Page",
  description: "Practical Academy | Home Page",
};

export default function Home() {
  return <HomePage />;
}
