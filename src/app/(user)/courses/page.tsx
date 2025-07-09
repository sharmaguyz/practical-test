import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Practical Academy | Courses Page",
  description: "Practical Academy | Courses Page",
};
import CourseList from "@/components/user/course/CourseList";
export default function Courses() {
  return <CourseList/>;
}