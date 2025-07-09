
import { Metadata } from "next";
import Dashboard from "@/components/user/Dashboard";
export const metadata: Metadata = {
  title: "Practical Academy | Dashboard",
  description: "Practical Academy | Dashboard",
};

export default function UserDashboard() {
  return <Dashboard/>;
}
