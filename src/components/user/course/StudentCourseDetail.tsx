"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from '@/components/config/config';
import { useNotification } from '@/context/NotificationContext';
import { formatDuration } from "@/helpers/commonHelper";
import Link from "next/link";
import { isStudentLoggedIn } from "@/helpers/commonHelper";
import { getLoggedInUser } from "@/helpers/authHelper";
type CourseProps = {
    id: string | number;
};
export interface CourseDetail {
    id: string;
    courseName: string;
    courseNameLower: string;
    courseImage: string;
    description: string;
    price: string;
    courseDuration: string;
    courseCategory: string;
    createdAt: string;
    updatedAt: string;
    published: string;
    isApproved: string;
    status: string;
    operatingSystem: string;
    reason: string;
    instructorId: string;
    start_date: string;
    end_date: string;
    instructor: {
        fullName: string;
    };

    instructorMetaData: {
        profilePic: string;
        organization: string;
        jobTitle: string;
        expectedStudents: string;
        topicTeach: string;
        bio: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        id: string;
    };
}

export default function StudentCourseDetailPage({ id }: CourseProps) {
    const [detail, setDetail] = useState<CourseDetail | null>(null);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState<boolean>(true);
    const [studentCount, setStudentCount] = useState<number>(0);
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                let url = `${API_BASE_URL}/api/v1/user/course-detail/${id}`;
                const response = await fetch(url, { method: "GET" });
                const apidata = await response.json();
                if(!response.ok){
                    throw new Error();
                }
                if (response.ok && apidata?.data?.detail) {
                    setDetail(apidata?.data?.detail);
                    setStudentCount(apidata?.data?.studentCount);
                }
            } catch (error) {
                console.error('Error fetching course detail:', error);
                showNotification('', "Failed to load course detail. Please try again later.", "error");
                return;
            } finally {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);
    return (
        <>
            <div className="breadcrumbs">
                <div className="container mx-auto">
                    <div className="inner-breadcrumbs">
                        <nav className="flex card bg-white justify-between items-center" aria-label="Breadcrumb">
                            <div className="breadcrumbs-current-page">
                                <h2>Course Details</h2>
                            </div>
                            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                                <li className="inline-flex items-center">
                                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 ">
                                        Dashboard </Link>
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
            {loading ? (
                <div className="container mt-3">
                    <div className="bg-white rounded shadow p-6 animate-pulse space-y-6">
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                        </div>

                        <div className="h-32 w-48 bg-gray-200 rounded border border-gray-200 shadow-sm"></div>

                        <div className="mt-6">
                            <div className="h-8 w-48 bg-gray-400 rounded"></div>
                        </div>
                    </div>
                </div>

            ) : (
                <div className="container mt-3">
                    <div className="bg-white rounded shadow p-6">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">{detail?.courseName}</h1>
                            <p className="text-sm text-gray-500">Created on: {detail?.createdAt}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                            <div>
                                <p>
                                    <span className="font-semibold">Instructor:</span> {detail?.instructor?.fullName}
                                </p>
                                <p>
                                    <span className="font-semibold">Category:</span> {detail?.courseCategory}
                                </p>
                                <p>
                                    <span className="font-semibold">Duration:</span>{' '}
                                    {detail?.courseDuration ? formatDuration(detail?.courseDuration) : ''}
                                </p>
                                <p>
                                    <span className="font-semibold">Price:</span> ${detail?.price}
                                </p>
                                <p>
                                    <span className="font-semibold">Course Start Date:</span> {detail?.start_date}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="font-semibold">Status :</span>
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                        Active
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Enrolled Students:</span> {studentCount}
                                </p>
                                <p>
                                    <span className="font-semibold">Course End Date:</span> {detail?.end_date}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Course Description</h2>
                            <p className="text-gray-700 leading-relaxed">{detail?.description}</p>
                        </div>
                        <div className="mt-6">
                            <img
                                src={detail?.courseImage}
                                alt="Course Thumbnail"
                                className="w-48 rounded border border-gray-200 shadow-sm"
                            />
                        </div>

                    </div>
                </div>

            )}
        </>
    )
}