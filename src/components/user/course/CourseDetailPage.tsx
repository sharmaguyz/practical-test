"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/components/config/config';
import { useNotification } from '@/context/NotificationContext';
import Link from "next/link";
import { formatDuration } from "@/helpers/commonHelper";
import { isStudentLoggedIn } from "@/helpers/commonHelper";
import { getLoggedInUser } from "@/helpers/authHelper";
import { useCart } from '@/context/CartContext';
import { useRouter } from "next/navigation";
type DetailProps = {
  id: string | number;
};
type CourseDetail = {
  id: string;
  courseName: string;
  courseImage: string;
  description: string;
  price: string;
  courseDuration: string;
  courseCategory: string;
  createdAt: string;
  instructor: {
    fullName: string;
  };
  instructorMetaData: {
    profilePic: string;
    organization: string;
    jobTitle: string,
    expectedStudents: number
  };
};
export default function CourseDetailPage({ id } : DetailProps){
    const [detail, setDetail] = useState<CourseDetail | null>(null);
    const { showNotification } = useNotification();
    const loggedinStatus = isStudentLoggedIn();
    const [cartData, setCartData] = useState<{ courseId: string | number; quantity: number }>({
      courseId: id,
      quantity: 1,
    });
    const { incrementCart } = useCart();
    const [loading, setLoading] = useState<boolean>(true);
    const [alreadypurchased, setAlreadyPurchased] = useState<boolean>(false);
    const [studentCount, setStudentCount] = useState<number>(0);
    const router = useRouter();
    useEffect(() => {
      const fetchDetail = async () => {
        try {
          let url = `${API_BASE_URL}/api/v1/user/course-detail/${id}`;
          if(loggedinStatus){
            const { userId } = getLoggedInUser();
            url = `${API_BASE_URL}/api/v1/user/course-detail/${id}?userId=${userId}`
          }
          const response = await fetch(url, { method: "GET" });
          const apidata = await response.json();
          if(response.ok && apidata?.data?.detail){
            setDetail(apidata?.data?.detail);
            setAlreadyPurchased(apidata?.data?.alreadyPurchased);
            setStudentCount(apidata?.data?.studentCount);
          }
        } catch (error) {
          console.error('Error fetching course detail:', error);
          showNotification('', "Failed to load course detail. Please try again later.", "error");
          return;
        } finally {
          console.log("finally");
          window.scrollTo({ top: 0, behavior: "smooth" });
          setLoading(false);
        }
      };
      fetchDetail();
    }, [id]);
    const handleCart = async (redirection: string | null) => {
      try {
        if(studentCount == detail?.instructorMetaData?.expectedStudents){
          showNotification('',`This course has reached its maximum enrollment limit of ${detail?.instructorMetaData?.expectedStudents} students. Please explore other available courses to continue learning.`,'error');
          return;
        }
        if(redirection !== 'tocheckout') setLoading(true);
        const { token, IdToken, AccessToken } = getLoggedInUser();
        const response = await fetch(`${API_BASE_URL}/api/v1/user/add-to-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-ID-TOKEN": IdToken || "", 
            "X-ACCESS-TOKEN": AccessToken || "",
          },
          body: JSON.stringify(cartData),
        });
        const data = await response.json();
        localStorage.setItem("via", JSON.stringify({ detail: true, courseId: String(id) }));
        if (!response.ok) {
          if (response.status === 409) {
            if (redirection === 'tocheckout') {
              router.push('/checkout');
            }else{
              showNotification('', data?.data.message, 'error');
            }
          }else{
            throw new Error(data?.data.message || 'Failed to add to cart');
          }
        }
        if(response.status !== 409) incrementCart();
        if (redirection === 'tocheckout') {
         router.push('/checkout');
        }else if(redirection !== 'tocheckout'){
          return showNotification('', data?.data.message, 'success')
        };
      } catch (error) {
        return showNotification('', 'Something went wrong while adding to cart.', 'error');
      } finally {
        setLoading(false);
      }
    };
    const handlePurchase = () => {
      if(studentCount == detail?.instructorMetaData?.expectedStudents){
        showNotification('',`This course has reached its maximum enrollment limit of ${detail?.instructorMetaData?.expectedStudents} students. Please explore other available courses to continue learning.`,'error');
        return;
      }else{
        localStorage.setItem("courseId",String(id));
        localStorage.setItem("via", JSON.stringify({ detail: true, courseId: String(id) }));
        router
      }
    }
    return <div>
        <div className="breadcrumbs">
          <div className="container mx-auto">
            <div className="inner-breadcrumbs">
              <nav className="flex card bg-white justify-between items-center" aria-label="Breadcrumb">
                <div className="breadcrumbs-current-page">
                  <h2>Course Detail</h2>
                </div>
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                  <li className="inline-flex items-center">
                    <a href="index.html" className="inline-flex items-center text-sm font-medium text-gray-700 ">
                      Home </a>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="rtl:rotate-180  w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                      </svg>
                      <Link href="/courses" className="inline-flex items-center text-sm font-medium text-gray-700 ">
                        Course</Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="rtl:rotate-180  w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                      </svg>
                      <span className="ms-1 text-sm font-medium md:ms-2">{detail?.courseName}</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        {loading ? 
          (
            <>
              <section className="public-course-detail animate-pulse">
                <div className="container mx-auto">
                  <div className="inner-public-course-detail">
                    <div className="card bg-white">
                      <div className="course-detail-wrapper">
                        <div className="course-image bg-gray-200 h-64 rounded" />

                        <div className="flex space-x-4" style={{ width: '100%' }}>
                          <div className="course-detail-inner-wraper space-y-4 w-full">
                            <div className="course-name">
                              <div className="course_details-top">
                                <div className="h-6 bg-gray-200 w-3/4 rounded mb-4" />

                                <div className="course_details-meta">
                                  <div className="course_details-meta-left space-y-4">
                                    <div className="course_details-author flex gap-3">
                                      <div className="w-12 h-12 bg-gray-300 rounded-full" />
                                      <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 w-32 rounded" />
                                        <div className="h-4 bg-gray-200 w-48 rounded" />
                                      </div>
                                    </div>

                                    <div className="course_details-category">
                                      <div className="h-4 bg-gray-200 w-24 rounded mb-1" />
                                      <div className="h-4 bg-gray-200 w-32 rounded" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="course-bref-detail">
                              <div className="course_details-content space-y-2">
                                <div className="h-5 bg-gray-200 w-40 rounded mb-3" />
                                <div className="h-4 bg-gray-100 rounded w-full" />
                                <div className="h-4 bg-gray-100 rounded w-5/6" />
                                <div className="h-4 bg-gray-100 rounded w-4/6" />
                              </div>
                            </div>
                          </div>

                          <div className="course_details-sidebar w-80 space-y-4">
                            <div className="course_details-price h-8 bg-gray-300 w-1/2 rounded mx-auto" />

                            <div className="course_details-list space-y-3">
                              {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <div className="h-4 bg-gray-200 w-1/2 rounded" />
                                  <div className="h-4 bg-gray-200 w-1/3 rounded" />
                                </div>
                              ))}

                              <div className="common-btn mt-4">
                                <div className="h-10 bg-gray-300 rounded-full w-full" />
                              </div>
                              <div className="common-btn m-2">
                                <div className="h-10 bg-gray-200 rounded-full w-full" />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )
            : (
          <>
            <section className="public-course-detail">
              <div className="container mx-auto">
                <div className="inner-public-course-detail">
                  <div className="card bg-white">
                    <div className="course-detail-wrapper">
                      <div className="course-image">
                        <img src={detail?.courseImage} alt="" />
                      </div>
                      <div className="flex space-x-4" style={{ width: '100%' }}>
                        <div className="course-detail-inner-wraper">
                          <div className="course-name">
                            <div className="course_details-top">
                              <h5 className="course_details-title">{detail?.courseName}</h5>
                              <div className="course_details-meta">
                                <div className="course_details-meta-left">
                                  <div className="course_details-author">
                                    <div className="course_details-author-img">
                                      <img src={detail?.instructorMetaData?.profilePic ?? '/web/images/user-placeholder.jpg'} alt="" />
                                    </div>
                                    <div className="course_details-author-info">
                                      <span>{detail?.instructorMetaData?.jobTitle}</span>
                                      <h5><a href="team.html">{detail?.instructor?.fullName}, {detail?.instructorMetaData?.organization}</a></h5>
                                    </div>
                                  </div>
                                  <div className="course_details-category">
                                    <span>Categories</span>
                                    <h5><a href="#">{detail?.courseCategory}</a></h5>
                                  </div>
                                  {/* <div className="course_details-rating">
                                    <span>Review</span>
                                    <ul>
                                      <li><i className="bx bxs-star text-yellow-500 text-xl" /></li>
                                      <li><i className="bx bxs-star text-yellow-500 text-xl" /></li>
                                      <li><i className="bx bxs-star text-yellow-500 text-xl" /></li>
                                      <li><i className="bx bxs-star text-yellow-500 text-xl" /></li>
                                      <li><i className="bx bxs-star text-yellow-500 text-xl" /></li>
                                    </ul>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="course-bref-detail">
                            <div className="course_details-content">
                              <h4 className="course_details-content-title mb-15">Courses Description</h4>
                              <p>{detail?.description}</p>
                            
                              {/* <h4 className="course_details-content-title mb-20">What you will learn in this
                                course</h4>
                              <div className="course_details-content-list">
                                <ul>
                                  <li>Etyma protium et olio gravida cur abitur est dui viverrid non mi
                                    egret</li>
                                  <li>Dictum Bibendum sapiens internum malasada fames ac ante ipsum primes
                                  </li>
                                  <li>Fauci bus cur abitur pulvinar rut rum masa sed so dales sapiens
                                    utricles</li>
                                </ul>
                              </div> */}
                            </div>
                          </div>
                        </div>
                        <div className="course_details-sidebar">
                          <div className="course_details-price">
                            <h2>${detail?.price}.00 </h2>
                            {/* <del>$36.00</del> */}
                          </div>
                          <div className="course_details-list">
                            <ul>
                              <li>
                                <span className="sidebar-title"><img src="/web/images/time-clock.png" alt="" />
                                  Duration</span>
                                <span>{detail?.courseDuration ? formatDuration(detail?.courseDuration) : ''}</span>
                              </li>
                              <li>
                                <span className="sidebar-title"><i className="bx bx-group" /> Students</span>
                                <span>{studentCount}</span>
                              </li>
                              {/* <li>
                                <span className="sidebar-title"><i className="bx bx-book" /> Lessons</span>
                                <span>42</span>
                              </li>
                              <li>
                                <span className="sidebar-title"><img src="/web/images/language.png" alt="" />
                                  Language</span>
                                <span>English</span>
                              </li> */}
                              <li>
                                <span className="sidebar-title"><i className="bx bx-user" /> Instructor</span>
                                <span>{detail?.instructor?.fullName}, {detail?.instructorMetaData?.organization}</span>
                              </li>
                              {/* <li>
                                <span className="sidebar-title"><img src="/web/images/percent.png" alt="" /> Pass
                                  Percentage</span>
                                <span>84%</span>
                              </li>
                              <li>
                                <span className="sidebar-title"><i className="bx bx-calendar-alt" />
                                  Deadline</span>
                                <span>24 March 2023</span>
                              </li> */}
                            </ul>
                            <div className="common-btn">
                              {
                                !loggedinStatus ? (
                                    <a type='button' onClick={ handlePurchase } className="browse-btn rounded-full cursor-pointer"><span>Purchase Courses</span></a>
                                  ) : ( !alreadypurchased && loggedinStatus && 
                                  <a type='button' onClick={ () => handleCart('tocheckout') } className="browse-btn rounded-full cursor-pointer"><span>Purchase Courses</span></a>
                                )
                              }
                              {
                                alreadypurchased && loggedinStatus && <a type='button' className="browse-btn rounded-full cursor-pointer pointer-events-none"><span>Purchased</span></a>
                              }
                            </div>
                            { loggedinStatus && !alreadypurchased &&  <div className="common-btn m-2">
                              <a type='button' onClick={ () => handleCart(null) } className="browse-btn rounded-full cursor-pointer"><span>{loading ? 'Adding...' : 'Add To Cart'}</span></a>
                            </div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>)}
      </div>;
}