"use client"
import Link from "next/link"
import { useState, useEffect } from "react";
import ChangePassword from "./dashboardComponent/ChangePassword";
import { isStudentLoggedIn } from "@/helpers/commonHelper";
import { getLoggedInUser } from "@/helpers/authHelper";
import { API_BASE_URL } from '@/components/config/config';
import { formatDuration } from "@/helpers/commonHelper";
type Course = {
  courseId: string;
  courseName: string;
  purchasedAt: string;
  courseImage: string;
  courseDuration?: string;
  price: number;
  description: string;
  instructorName: string;
  orderId: string;
  startDate: string;
  endDate: string;
};
interface User {
  email: string;
  fullName: string;
  id: string;
  phoneNumber: string;
}
interface UserMetaData {
  country: string;
  city: string;
  linkedin: string;
  portfolio: string;
  state: string;
}
export default function Dashboard() {
  const [show, setShow] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User>({} as User);
  const [userMetaData, setUserMetaData] = useState<UserMetaData>({} as UserMetaData);
  const loggedinStatus = isStudentLoggedIn();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  if(!loggedinStatus) return;
  const handleShow = (number: number) => {
    setShow(number);
  }
  useEffect(() => {
    if(loggedinStatus){
      getMyCourses();
      getMyProfile();
    }
  }, [loggedinStatus]);
  
  const getMyCourses = async() => {
    try {
      const { token, IdToken, AccessToken } = getLoggedInUser();
      const response = await fetch(`${API_BASE_URL}/api/v1/user/my-courses`, { method: "GET", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-ID-TOKEN": IdToken || "", 
          "X-ACCESS-TOKEN": AccessToken || "",
        },
      });
      const apidata = await response.json();
      setCourses(apidata.data.courses);
    } catch (error) {
      console.log(error);
    } finally{
      setIsLoading(false);
    }
  }
  const getMyProfile = async() => {
    const { token, IdToken, AccessToken } = getLoggedInUser();
    try {
        if (token && IdToken && AccessToken) {
          const response = await fetch(`${API_BASE_URL}/api/v1/user/get-profile`, {
              method: 'GET',
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                  "X-ID-TOKEN": IdToken,
                  "X-ACCESS-TOKEN": AccessToken,
              },
          });
          const data = await response.json();
          setUser(data.data.student);
          setUserMetaData(data?.data?.studentMetaData);
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
  }
  return (
    <>
      <div className="breadcrumbs">
        <div className="container mx-auto">
          <div className="inner-breadcrumbs">
            <nav className="flex card bg-white justify-between items-center" aria-label="Breadcrumb">
              <div className="breadcrumbs-current-page">
                <h2>Your Dashboard</h2>
              </div>

              <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                  <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 "> Home </a>
                </li>

                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="rtl:rotate-180  w-3 h-3 mx-1" aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" d="m1 9 4-4-4-4" />
                    </svg>

                    <span className="ms-1 text-sm font-medium md:ms-2">Dashboard</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <div className="about-us">
        <div className="container mx-auto">
          <div className="inner-about">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 dash-flex">
              <div className="card bg-white lwu-bg-img flex items-center left-card-dash">
                <div className="left-wwa">
                  {/* Left Side Menu */}
                  <div className="left-menu">
                    <ul className="nav" id="tabs">
                      <li className="nav-item">
                        <a className={`nav-link ${show === 1 ? "active" : ""}`} onClick={() => handleShow(1)} data-target="profile">My Courses</a>
                      </li>
                      <li className="nav-item">
                        <a className={`nav-link ${show >= 2 && show <= 4 ? "active" : ""}`} onClick={() => handleShow(2)} data-target="registration">My Profile</a>
                      </li>
                      <li className="nav-item">
                        <a className={`nav-link ${show === 5 ? "active" : ""}`} onClick={() => handleShow(5)} data-target="download">Download Certificate</a>
                      </li>
                      {/* <li className="nav-item">
                        <a className={`nav-link ${show === 6 ? "active" : ""}`} onClick={() => handleShow(6)} data-target="logout">Logout</a>
                      </li> */}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card bg-white right-card-dash">
                {/* <div class="wwa-img">
                            <img src="images/WWA.png" alt="">
                        </div> */}
                <div className="content">
                  {/* Profile Tab */}
                  <div id="profile" className={`tab-pane  ${show === 1 ? "active" : ""}`}>
                    <h3>Welcome to Your Profile</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Course Image</th>
                          <th>Course Name</th>
                          <th>Instructor Name</th>
                          <th>Course Description</th>
                          <th>Course Price</th>
                          <th>Course Duration</th>
                          <th>Course Start Date</th>
                          <th>Course End Date</th>
                          <th>Date Purchased</th>
                          <th>View Invoice</th>
                          <th>View Details</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                      {isLoading ? (
                        [...Array(5)].map((_, index) => (
                          <tr key={index}>
                            {[...Array(13)].map((_, i) => (
                              <td key={i} className="align-top">
                                <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                              </td>
                            ))}
                          </tr>
                        ))
                        ) : (
                          courses.length > 0 ? (
                            courses.map((course, index) => (
                              <tr key={course.courseId}>
                                <td className="align-top">{index + 1}</td>
                                <td className="align-top">
                                  <img
                                    src={course.courseImage}
                                    alt="course image"
                                    width={50}
                                    height={50}
                                    className="w-[60px] h-[60px] object-cover rounded"
                                  />
                                </td>
                                <td className="align-top">{course.courseName}</td>
                                <td className="align-top">{course.instructorName}</td>
                                <td className="align-top">
                                  {course.description?.split(" ").slice(0, 5).join(" ") +
                                    (course.description?.split(" ").length > 5 ? "..." : "")}
                                </td>
                                <td className="align-top">${course.price}.00</td>
                                <td className="align-top">{formatDuration(course.courseDuration)}</td>
                                <td className="align-top">{course.startDate}</td>
                                <td className="align-top">{course.endDate}</td>
                                <td className="align-top">{course.purchasedAt}</td>
                                <td className="align-top">
                                  <span className="view-invoice">
                                    <Link href={`/course-invoice/${course.orderId}/${course.courseId}`}>View</Link>
                                  </span>
                                </td>
                                <td className="align-top">
                                  <span className="view-invoice">
                                    <Link href={`/course-details/${course.courseId}`}>View</Link>
                                  </span>
                                </td>
                                <td className="align-top">Active</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="!text-center" colSpan={13}>
                                You haven't purchased any courses yet.
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Registration Tab */}
                  <div id="registration" className={`tab-pane  ${show >= 2 && show <= 4 ? "active" : ""}`}>
                    <div className="info-btn">
                      <button className="btn btn-primary" id="login-btn" onClick={() => handleShow(3)}>Profile Information</button>
                    </div>
                    <div className="info-btn">
                      <button className="btn btn-secondary" id="change-password-btn" onClick={() => handleShow(4)}>Change Password</button>
                    </div>
                    <div id="login-form" className={`change-form ${show === 3 ? "" : "hidden"}`}>
                      <h2>Profile Information</h2>
                      <span><Link href="">
                        edit
                      </Link></span>
                      <div className="profile-input">
                        <div className="input-info">
                          <label htmlFor="full_name">Full Name</label>
                          <p>{user.fullName}</p>
                          {/* <input type="text" class="form-control" placeholder="Username" id="full_name"> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="email">
                            Email Address </label>
                          <p>{user.email}</p>
                          {/* <input type="email" class="form-control" placeholder="Email Address" id="email"> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="phone">
                            Phone Number</label>
                          <p>{user.phoneNumber}</p>
                          {/* <input type="text" class="form-control" placeholder="Phone Number" id="phone"> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="country">
                            Country of Residence </label>
                          <p>{userMetaData.country}</p>
                          {/* <select name="" id="country">
                                            <option value="">
                                                Afghanistan
                                            </option>
                                            <option value="">
                                                Afghanistan
                                            </option>
                                        </select> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="state">
                            State/Province (If applicable)</label>
                          <p>{userMetaData.state}</p>
                          {/* <select name="" id="state">
                                            <option value="">
                                                Afghanistan
                                            </option>
                                            <option value="">

                                                Select State

                                            </option>
                                        </select> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="city">
                            City </label>
                          <p>{userMetaData.city}</p>
                          {/* <input type="email" class="form-control" placeholder="City" id="city"> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="linkedin">
                            LinkedIn Profile </label>
                          <p>{userMetaData.linkedin}</p>
                          {/* <input type="text" class="form-control" placeholder="LinkedIn Profile"
                                            id="linkedin"> */}
                        </div>
                        <div className="input-info">
                          <label htmlFor="github">
                            GitHub/Portfolio </label>
                          <p>{userMetaData.portfolio}</p>
                          {/* <input type="text" class="form-control" placeholder="GitHub/Portfolio"
                                            id="github"> */}
                        </div>
                        <div className="clear" />
                      </div>
                      {/* <button class="btn btn-primary">Submit</button> */}
                    </div>
                    <ChangePassword show={show}/>
                  </div>
                  {/* Download Tab */}
                  <div id="download" className={`tab-pane  ${show === 5 ? "active" : ""}`}>
                    <h2>Download Certificate</h2>
                    <p>You can download your course completion certificate for any completed courses.</p>
                    <button className="btn btn-primary" id="download-btn">Download Certificate</button>
                  </div>
                  {/* logout */}
                  <div id="logout" className={`tab-pane  ${show === 6 ? "active" : ""}`}>
                    <h2>Logout</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}