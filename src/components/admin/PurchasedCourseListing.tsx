"use client";
import DataTable from "@/components/tables/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { fetchData } from "@/helpers/apiHelper";
import { API_BASE_URL } from "../config/config";
import { useNotification } from '@/context/NotificationContext';
import { formatDuration } from "@/helpers/commonHelper";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Tooltip, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
export default function PurchasedCourseListing(){
    const [rowCount, setRowCount] = useState(0);
    const [mainloading, setMainLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const { showNotification } = useNotification();
    const isMountedRef = useRef(true);
    const [searchText, setSearchText] = useState<string>("");
    const [rows, setRows] = useState<any[]>([]);
    const router = useRouter();
    const columns: GridColDef[] = [
        {
            field: "serial",
            headerName: "Sr. No",
            width: 80,
            sortable: false,
        },
        {
            field: "studentName",
            headerName: "Student Name",
            width: 180,
            sortable: false,
        },
        
        {
            field: "instructorName",
            headerName: "Instructor Name",
            width: 180,
            sortable: false,
        },
        
        {
            field: "courseName",
            headerName: "Course Name",
            width: 180,
            flex: 1, 
            sortable: false,
        },
        {
            field: "courseImage",
            headerName: "Course Thumbnail",
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <img src={params.value} alt="Thumbnail" style={{ width: 50, height: 50, objectFit: "cover" }} />
            ),
        },
        {
            field: "courseDescription",
            headerName: "Course Description",
            width: 180,
            flex: 1, 
            sortable: false,
        },
        {
            field: "courseDuration",
            headerName: "Course Duration",
            width: 130,
            sortable: false,
            renderCell: (params) => {
                return formatDuration(params.row.courseDuration);
            }
        },
        {
            field: "coursePrice",
            headerName: "Course Price",
            width: 180,
            flex: 1, 
            sortable: false,
            renderCell: (params) => (
                <span>${params.row.coursePrice}</span>
            ),
        },
        {
            field: "startDate",
            headerName: "Course Start Date",
            width: 180,
            flex: 1, 
            sortable: false,
        },
        {
            field: "endDate",
            headerName: "Course End Date",
            width: 180,
            flex: 1, 
            sortable: false,
        },
        {
            field: "purchaseDate",
            headerName: "Purchase Date",
            width: 150,
            sortable: false,
        },
        {
            field: "paymentStatus",
            headerName: "Payment Status",
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">{params.value.charAt(0).toUpperCase() + params.value.slice(1)}</span>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            // flex: 1,
            renderCell: (params) => {
                const handleShowDetails = async () => {
                    return router.push(`/admin/course-invoice/${params.row.orderId}/${params.row.courseId}`);
                }
                const handleDetails = async () => {
                    return router.push(`/admin/course-detail/${params.row.courseId}`)
                }
                return (
                    <>
                        <Tooltip title="View Invoice">
                            <IconButton size="small" color="primary" onClick={handleShowDetails}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={handleDetails}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                );
            }
        },
    ];
    const fetchTableData = useCallback(async () => {
            setMainLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    return;
                }
                const response: any = await fetchData(
                    `${API_BASE_URL}/api/v1/admin/purchased-courses?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&search=${searchText}`, token,
                );
                if (response?.error) {
                    if (response?.error === 'Invalid or expired token') {
                        return;
                    }
                    showNotification('', "Failed to load courses. Please try again later.", "error");
                    return;
                }
                if (isMountedRef.current && response?.data) {
                    const courseList = response.data?.data?.purchasedCourses?.purchases;
                    const pagination = response.data?.data?.purchasedCourses?.pagination;
                    const offset = paginationModel.page * paginationModel.pageSize;
                    const rowsWithSerial = courseList.map((row: any, index: number) => ({
                        ...row,
                        id: `${index}-${Date.now()}`,
                        serial: offset + index + 1,
                    }));
                    setRows(rowsWithSerial);
                    if (pagination) {
                        setRowCount(pagination.totalCount ?? courseList.length);
                    }
                }
            } catch (err) {
                console.log(err);
                if (isMountedRef.current) {
                    showNotification("Failed to load courses. Please try again later.", "error");
                }
            } finally {
                if (isMountedRef.current) {
                    setMainLoading(false);
                }
            }
    }, [paginationModel, searchText]);
    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);
    return <>
        <DataTable
            columns={columns}
            rows={rows}
            rowCount={rowCount}
            loading={mainloading}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onQueryChange={() => { }}
            is_show_button={false}
            searchPlaceholder="Search Course"
            button_text=""
            button_link=""
        />
    </>
}