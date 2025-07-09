"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/components/config/config";
import { useNotification } from '@/context/NotificationContext';
import Link from "next/link";
import { formatDuration } from "@/helpers/commonHelper";
import Suggestion from "./Suggestion";
export interface Course {
  id: string;
  courseName: string;
  description: string;
  instructorId?: string;
  isApproved: 'pending' | 'completed' | 'rejected';
  published: '' | 'pending' | 'completed' | 'rejected';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  courseImage?: string;
  courseDuration?: string;
  price?: string;
  operatingSystem?: string;
  courseCategory?: string;
  reason?: string;
  instructor?: {
    fullName: string;
  };
  instructorMetaData?: {
    profilePic?: string;
    organization?: string;
  };
  universityImage?:string
}

export interface Pagination {
  totalFetched: number;
  currentPage: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
  totalCount: number;
}
export default function CourseList(){
    const [courses, setCourses] = useState<Course[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
      totalFetched: 0,
      currentPage: 1,
      limit: 16,
      hasMore: false,
      totalPages: 1,
      totalCount: 0,
    });
    const [sortOrder, setSortOrder] = useState<string>('default');
    const [searchText,setSearchText] = useState<string>('');
    const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
    const [loading, setLoading] = useState<boolean>(true);
    const [suggestions, setSuggestions] = useState<{ courseName: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = start + pagination.totalFetched - 1;
    useEffect(() => {
    fetchData(pagination.currentPage);
    }, [pagination.currentPage,sortOrder,debouncedSearchText]);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchText(searchText);
      }, 500);
      return () => clearTimeout(handler);
    }, [searchText]);
    const { showNotification } = useNotification();
    const goToPage = (page: number) => {
      if (page !== pagination.currentPage && page >= 1 && page <= pagination.totalPages) {
        setPagination((prev) => ({ ...prev, currentPage: page }));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });

    };
    const fetchData = async (page = 1) => {
        try {
          setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/v1/user/courses?page=${page}&sortOrder=${sortOrder}&searchText=${searchText}`, { method: "GET" });
            const apidata = await response.json();
            if (response.ok && apidata?.data?.courses) {
                setCourses(apidata?.data?.courses);
                setPagination(apidata?.data?.pagination);
            } else {
                showNotification('', "Failed to load courses. Please try again later.", "error");
                return;
            }
        } catch (error) {
            showNotification('', "Failed to load courses. Please try again later.", "error");
            return;
        } finally {
          setLoading(false);
        }
    };
    useEffect(() => {
      const trimmedSearch = searchText.trim();
      const controller = new AbortController();
      if (!trimmedSearch) {
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
      const fetchSuggestions = async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/user/courses/suggestions?searchText=${encodeURIComponent(trimmedSearch)}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          setSuggestions(data?.data?.suggestions || []);
          setShowSuggestions(true);
        } catch (err : any) {
          if (err.name !== 'AbortError') {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      };
      const debounceTimer = setTimeout(fetchSuggestions, 300);
      return () => {
        clearTimeout(debounceTimer);
        controller.abort(); 
      };
    }, [searchText]);
    const getPageNumbers = () => {
        const total = pagination.totalPages;
        const current = pagination.currentPage;
        const delta = 2;
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];
        let l: number | undefined = undefined;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }
        for (const i of range) {
            if (l !== undefined) {
            if ((i as number) - l === 2) {
                rangeWithDots.push(l + 1);
            } else if ((i as number) - l > 2) {
                rangeWithDots.push("...");
            }
            }
            rangeWithDots.push(i);
            l = i as number;
        }
        return rangeWithDots;
    };
    return (
      <>
        <div className="breadcrumbs">
          <div className="container mx-auto">
            <div className="inner-breadcrumbs">
              <nav className="flex card bg-white justify-between items-center" aria-label="Breadcrumb">
                <div className="breadcrumbs-current-page">
                  <h2>Public Course</h2>
                </div>
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                  <li className="inline-flex items-center">
                    <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 "> Home </a>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="rtl:rotate-180  w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                      </svg>
                      <span className="ms-1 text-sm font-medium md:ms-2">Course</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        {loading ? (  <section className="public-course">
            <div className="container mx-auto">
              <div className="inner-public-course">
                <div className="card bg-white sec-bg-img p-6">
                   <div className="flex flex-wrap items-center justify-between pb-6">
                    <div className="relative w-full md:w-64">
                      <input type="text" placeholder="Search Item" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full border border-gray-300 rounded pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 course-search" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {/* Search Icon */}
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx={11} cy={11} r={8} />
                          <line x1={21} y1={21} x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <Suggestion
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        onSelect={(sugg) => {
                          setSearchText(sugg);
                          setShowSuggestions(false);
                        }}
                      />
                    </div>
                    <div className="text">
                      <p className="text-gray-700 text-sm mb-4 md:mb-0">Showing 0-0 of 0 results</p>
                    </div>
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <select className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-64"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <option>Select Sorting</option>
                        <option value="default">By Default</option>
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                      </select>
                      {/* Search */}
                      
                    </div>
                  </div>
                  <div className="public-courses-boxes grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse space-y-4 bg-white p-4 rounded shadow">
                        <div className="bg-gray-200 h-40 w-full rounded" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                          </div>
                          <div className="h-3 w-16 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>) : ( <section className="public-course">
          <div className="container mx-auto">
            <div className="inner-public-course">
              <div className="card bg-white sec-bg-img">
                <div className="flex flex-wrap items-center justify-between pb-6">
                  <div className="relative w-full md:w-64">
                      <input type="text" placeholder="Search Item" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full border border-gray-300 rounded pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 course-search" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {/* Search Icon */}
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx={11} cy={11} r={8} />
                          <line x1={21} y1={21} x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <Suggestion
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        onSelect={(sugg) => {
                          setSearchText(sugg);
                          setShowSuggestions(false);
                        }}
                      />
                    </div>
                  <div className="text">
                    <p className="text-gray-700 text-sm mb-4 md:mb-0">
                      {
                        pagination.totalCount > 0 ? `Showing ${start}–${end} of ${pagination.totalCount} results` : "Showing 0-0 of 0 results"
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <select className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-64"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option>Select Sorting</option>
                      <option value="default">By Default</option>
                      <option value="desc">Newest</option>
                      <option value="asc">Oldest</option>
                    </select>
                    {/* Search */}
                    
                  </div>
                </div>
                <div className="public-courses-boxes grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                    {courses.length > 0 && courses?.map((course) => (
                      <Link href={`/course-detail/${course.id}`} key={course.id} className="block">
                        <div className="card-box" key={course.id}>
                          <div className="card-box-img">
                              <img src={course.courseImage} alt={course.courseName} />
                              <div className="card-box-btn">
                                <a>
                                  <img src="/web/images/maki_arrow-black.png" alt="arrow" />
                                </a>
                              </div>
                          </div>
                          <div className="card-box-content">
                              <div className="card-title flex justify-between items-center">
                              <h4>{course.courseName}</h4>
                              {course?.universityImage ? (
                                <div className="brand-img">
                                  <img src={course.universityImage} alt="Brand Logo" />
                                </div>
                              ) : null}
                              </div>
                              <div className="course-price">
                              <h6>${course.price}</h6>
                              </div>
                              <div className="course-text">
                              <p>{course.description.length > 160 ? course.description.slice(0, 160) + '...' : course.description}</p>
                              </div>
                              <div className="course-box-bottom flex justify-between items-center">
                              <div className="author flex items-center gap-3">
                                  <div className="author-profile-img">
                                  <img src={course.instructorMetaData?.profilePic || '/web/images/user-placeholder.jpg'} alt="Author" />
                                  </div>
                                  <div className="author-name">
                                  <h5>{course.instructor?.fullName || 'Unknown Instructor'}</h5>
                                  </div>
                              </div>
                              <div className="course-duration">
                                  <h5>
                                  <img src="/web/images/time-clock.png" alt="Duration" /> Duration: <span>{formatDuration(course.courseDuration)}</span>
                                  </h5>
                              </div>
                              </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {courses.length == 0 && 
                      <div className="col-span-full text-center py-12">
                        <img
                          src="/web/images/no-result.png"
                          alt="No Results"
                          className="mx-auto w-50 h-50 mb-4 opacity-60"
                        />
                        {/* <p className="text-lg text-gray-500">No courses found.</p> */}
                      </div>
                    }
                </div>
                {pagination.totalCount > 16 && <div className="public-course-pagination">
                  <div className="flex items-center justify-between bg-white px-0 py-3 sm:px-0 mt-5">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                            <a 
                                type="button"
                                onClick={() => goToPage(pagination.currentPage - 1)}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </a>
                            {getPageNumbers().map((page, idx) =>
                                typeof page === "number" ? (
                                <a 
                                    type="button"
                                    key={idx}
                                    onClick={() => goToPage(page)}
                                    aria-current={page === pagination.currentPage ? "page" : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold cursor-pointer ${
                                    page === pagination.currentPage
                                        ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        : "text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                                    } focus:z-20`}
                                >
                                    {page}
                                </a>
                                ) : (
                                <span
                                    key={idx}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0"
                                >
                                    ...
                                </span>
                                )
                            )}
                            <a 
                                type="button"
                                onClick={() => goToPage(pagination.currentPage + 1)}
                                // disabled={pagination.currentPage === pagination.totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>}
              
              </div>
            </div>
          </div>
        </section>)
          }
       
      </>
    );
}