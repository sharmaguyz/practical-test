"use client";
import '@/assets/css/admin.custom.css';
import DataTable from "@/components/tables/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { useNotification } from '@/context/NotificationContext';
import { fetchData } from "@/helpers/apiHelper";
import { API_BASE_URL } from "../config/config";
import { Switch, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import { useLoading } from '@/context/LoadingContext';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { useConfirmation } from "@/context/ConfirmationContext";
import { Modal as BModal } from 'react-bootstrap';
import { formatDuration } from "../../helpers/commonHelper";
import { useRouter } from "next/navigation";

interface CourseDetails {
  courseCategory: string;
  courseDuration: string;
  courseImage: string;
  courseName: string;
  courseNameLower: string;
  createdAt: string;
  description: string;
  end_date: string;
  id: string;
  instructorId: string;
  isApproved: string;
  operatingSystem: string;
  operatingSystemImage: string;
  price: string;
  published: string;
  reason: string;
  start_date: string;
  status: string;
  universityImage: string;
  updatedAt: string;
}

export default function CourseListPage() {
    const router = useRouter();
    const [rows, setRows] = useState<any[]>([]);
    const { setLoading, setLoadingMessage } = useLoading();
    const [spinnerLoading, setSpinnerLoading] = useState<string | null>(null);
    const { confirm } = useConfirmation();
    const [showBModal, setBModal] = useState(false);
    const [courseDetails, setCourseDetails] = useState<CourseDetails>({} as CourseDetails);

    const { isOpen, openModal, closeModal } = useModal();
    const [workspaceTitle, setWorkspaceTitle] = useState("");
    const [workspaceItems, setWorkspaceItems] = useState([]);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionModal, setRejectionModal] = useState<{
        open: boolean;
        prevStatus: string;
        newStatus: string;
        onConfirm: (reason: string) => void;
        onCancel: () => void;
    } | null>(null);

    const reasonPrompt = (prevStatus: string, newStatus: string) => {
        return new Promise<string | null>((resolve) => {
            setRejectionReason("");
            setRejectionModal({
                open: true,
                prevStatus,
                newStatus,
                onConfirm: (reason) => {
                    setRejectionModal(null);
                    resolve(reason);
                },
                onCancel: () => {
                    setRejectionModal(null);
                    resolve(null);
                },
            });
        });
    };

    const [rowCount, setRowCount] = useState(0);
    const [mainloading, setMainLoading] = useState(false);
    const { showNotification } = useNotification();
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const isMountedRef = useRef(true);
    const [searchText, setSearchText] = useState<string>("");
    const columns: GridColDef[] = [
        {
            field: "serial",
            headerName: "Sr. No",
            width: 90,
            sortable: false,
        },
        {
            field: "courseName",
            headerName: "Course Name",
            width: 150,
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
            field: "price",
            headerName: "Course Price",
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <span>${params.row.price}</span>
            ),
        },
        {
            field: "courseCategory",
            headerName: "Course Category",
            width: 150,
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
            field: "isApproved",
            headerName: "Course Approve",
            width: 120,
            sortable: false,
            renderCell: (params) => {
                const [status, setStatus] = useState(params.row.isApproved);

                const handleToggle = async (event: ChangeEvent<HTMLSelectElement>) => {
                    const newStatus = event.target.value;
                    const prevStatus = status;
                    let reason;
                    if (newStatus === "completed") {
                        reason = "";
                        const confirmed = await confirm({ message: 'Are you sure you want to approve this course?' });
                        if (!confirmed) {
                            setStatus(prevStatus);
                            return;
                        };
                    } else if (newStatus === "rejected") {
                        const result = await reasonPrompt(prevStatus, newStatus);
                        if (!result) {
                            setStatus(prevStatus);
                            return;
                        }

                        reason = result;
                    }

                    try {
                        setLoading(true);
                        setLoadingMessage('Your request is being processed. This may take a few moments.');
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL}/api/v1/admin/course-approval`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                courseId: params.id,
                                status: newStatus,
                                reason: reason
                            }),
                        });

                        const result = await response.json();
                        if (!response.ok) {
                            showNotification("Error", result.message || "Failed to update status", "error");
                            return;
                        }

                        showNotification("Success", "Course status updated successfully", "success");
                        setStatus(newStatus);
                        fetchTableData();
                    } catch (error) {
                        showNotification("Error", "Failed to update status", "error");
                        setStatus(prevStatus);
                    } finally {
                        setLoading(false);
                        setLoadingMessage('');
                    }
                };

                return status === "pending" ? (
                    <select className="bg-white border border-gray-300 rounded p-1" onChange={(e) => handleToggle(e)} value={status}>
                        <option value="pending">Pending</option>
                        <option value="completed">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                ) : (status === "completed" ? <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">Approved</span> : <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-red-400 border border-red-400">Rejected</span>);
            },
        },
        {
            field: "published",
            headerName: "Course Publish",
            width: 120,
            sortable: false,
            renderCell: (params) => {
                const [status, setStatus] = useState(params.row.published);

                const handleToggle = async (event: ChangeEvent<HTMLSelectElement>) => {
                    const newStatus = event.target.value;
                    const prevStatus = status;
                    let reason;
                    if (newStatus === "completed") {
                        reason = "";
                        const confirmed = await confirm({ message: 'Are you sure you want to publish this course?' });
                        if (!confirmed) {
                            setStatus(prevStatus);
                            return;
                        };
                    } else if (newStatus === "rejected") {
                        const result = await reasonPrompt(prevStatus, newStatus);
                        if (!result) {
                            setStatus(prevStatus);
                            return;
                        }

                        reason = result;
                    }

                    try {
                        setLoading(true);
                        setLoadingMessage('Your request is being processed. This may take a few moments.');
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL}/api/v1/admin/course-publise`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                courseId: params.id,
                                status: newStatus,
                                reason: reason
                            }),
                        });

                        const result = await response.json();
                        if (!response.ok) {
                            showNotification("Error", result.message || "Failed to update status", "error");
                            return;
                        }

                        showNotification("Success", "Course status updated successfully", "success");
                        setStatus(newStatus);
                        fetchTableData();
                    } catch (error) {
                        showNotification("Error", "Failed to update status", "error");
                        setStatus(prevStatus);
                    } finally {
                        setLoading(false);
                        setLoadingMessage('');
                    }
                };

                return status === "pending" ? (
                    <select className="bg-white border border-gray-300 rounded p-1" onChange={(e) => handleToggle(e)} value={status}>
                        <option value="pending">Pending</option>
                        <option value="completed">Published</option>
                        <option value="rejected">Rejected</option>
                    </select>
                ) : (status === "completed" ? <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">Published</span> : (status === "rejected" ? <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-red-400 border border-red-400">Rejected</span> : <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-blue-400 border border-blue-400">Pending</span>));
            },
        },
        {
            field: "operatingSystem",
            headerName: "Operating Workspace",
            width: 60,
            sortable: false,
            flex: 1,
        },
        {
            field: "instructorName",
            headerName: "Instructor Name",
            width: 60,
            sortable: false,
        },
        {
            field: "createdAt",
            headerName: "Created At",
            width: 60,
            sortable: false,
        },
        {
            field: "workspaceStatus",
            headerName: "Workspace Status",
            width: 100,
            sortable: false,
            renderCell: (params) => {
                const handleShowDetails = async () => {
                    setLoading(true);
                    try {
                        await fetchWorkspaceDetails(params.row.id);
                        setWorkspaceTitle(params.row.courseName);
                        openModal();
                    } catch (error) {
                        showNotification('Error.', 'Failed to load details', 'error');
                        console.error("Failed to load details:", (error as Error).message);
                    } finally {
                        setLoading(false);
                    }
                };

                return params.row.workspaceStatus === "Inactive" ?
                    <Tooltip title={params.row.workspaceStatus} placement="top">
                        <span className="bg-red-500 text-white px-2 py-1 rounded" key={`workspace-status-index-0`}>
                            {params.row.workspaceStatus}
                        </span>
                    </Tooltip>
                    :
                    <Tooltip title="View Details" placement="top">
                        <div key={`workspace-status-index-0`}>
                            <span className="bg-green-500 text-white px-2 py-1 rounded">{params.row.workspaceStatus}</span>
                            <IconButton color="info" onClick={handleShowDetails}>
                                <InfoOutlinedIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                    ;
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            // flex: 1,
            renderCell: (params) => {
                const [innerLoading, setInnerLoading] = useState(false);
                const handleDelete = async () => {
                    const confirmed = await confirm({ message: 'Are you sure you want to delete this course?' });
                    if (!confirmed) return;

                    try {
                        setLoading(true);
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL}/api/v1/admin/courses/${params.id}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        const result = await response.json();
                        showNotification('Success.', result?.data?.message, 'success');
                        fetchTableData();
                    } catch (error) {
                        showNotification(
                            'Error.',
                            'Failed to delete course',
                            'error'
                        );
                        console.error("Error deleting user:", (error as Error).message);
                    } finally {
                        setLoading(false);
                    }
                };

                const handleShowDetails = async () => {
                    setInnerLoading(true);
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL}/api/v1/admin/course/${params.row.id}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        const result = await response.json();
                        setCourseDetails(result?.data?.course?.response || {});
                        setBModal(true);
                    } catch (error) {
                        showNotification('Error.', 'Failed to load details', 'error');
                        console.error("Failed to load details:", (error as Error).message);
                    } finally {
                        setInnerLoading(false);
                    }
                }

                return (
                    <>
                        <Tooltip title="View Details">
                            <IconButton
                                color="info"
                                onClick={handleShowDetails}
                                disabled={innerLoading}
                            >
                                {
                                    innerLoading ? (
                                        <RefreshOutlinedIcon className="animate-spin" />
                                    ) : <RemoveRedEyeOutlinedIcon />
                                }
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Course">
                            <IconButton
                                color="primary"
                                onClick={() => {
                                    router.push(`/admin/courses/update/${params.row.id}`);
                                }}
                                disabled={innerLoading}
                            >
                                <DriveFileRenameOutlineOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                color="error"
                                onClick={handleDelete}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                );
            }
        },
    ];

    const fetchWorkspaceDetails = async (courseId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/course-workspace/${courseId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            const workspaceDetails = result?.data?.workspaces;
            setWorkspaceItems(workspaceDetails || []);
        } catch (error) {
            showNotification("Error", "Failed to load workspace details", "error");
        }
    };

    const fetchTableData = useCallback(async () => {
        setMainLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            const response: any = await fetchData(
                `${API_BASE_URL}/api/v1/admin/courses?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&search=${searchText}`, token,
            );
            if (response?.error) {
                if (response?.error === 'Invalid or expired token') {
                    return;
                }
                showNotification('', "Failed to load courses. Please try again later.", "error");
                return;
            }
            if (isMountedRef.current && response?.data) {
                const courseList = response.data?.data?.courses;
                const courses = courseList?.courses ?? [];
                const pagination = courseList?.pagination;
                const processedCourses = (courses as any[]).map((course, index: number) => ({
                    ...course,
                    id: course.id || `${index}-${Date.now()}`,
                    serial: index + 1 + paginationModel.page * paginationModel.pageSize,
                    courseCategory: course.courseCategory || 'N/A',
                }));
                setRows(processedCourses);
                if (pagination) {
                    setRowCount(pagination.totalCount ?? courses.length);
                }
            }
        } catch (err) {
            if (isMountedRef.current) {
                showNotification("Failed to load courses. Please try again later.", "error");
            }
        } finally {
            if (isMountedRef.current) {
                setMainLoading(false);
            }
        }
    }, [paginationModel, searchText]);

    const handleRefreshState = (workspaceId: string, courseId: string) => async () => {
        setSpinnerLoading(workspaceId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/workspace/${workspaceId}/status`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            await response.json();
            fetchWorkspaceDetails(courseId);
        } catch (error) {
            showNotification("Error", "Failed to refresh workspace state", "error");
        } finally {
            setSpinnerLoading(null);
        }
    }

    const handleRefreshImageState = (imageId: string, courseId: string, workspaceId:string) => async () => {
        setSpinnerLoading(imageId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/workspace-image/${imageId}/status?workspaceId=${workspaceId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            await response.json();
            fetchWorkspaceDetails(courseId);
        } catch (error) {
            showNotification("Error", "Failed to refresh workspace state", "error");
        } finally {
            setSpinnerLoading(null);
        }
    }

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    return (
        <>
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

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[1200px] m-4">
                <div className="no-scrollbar relative w-full max-w-[1200px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {workspaceTitle}
                        </h4>

                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            WorkSpace ID
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Directory ID
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Username
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Operating System
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            WorkSpace Status
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            WorkSpace Image ID
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            WorkSpace Image Status
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {
                                        workspaceItems && workspaceItems.length > 0 ? (
                                            workspaceItems.map((item: any, index: number) => (
                                                <TableRow key={`workspace-item-index-${index}`}>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.workspace_id}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.directory_id}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.user_name}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.operating_system.toUpperCase()}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.state}
                                                        <Tooltip title="Refresh" placement="top">
                                                            <IconButton color="info" onClick={handleRefreshState(item.workspace_id, item.course_id)}>
                                                                <RefreshOutlinedIcon className={spinnerLoading === item.workspace_id ? `animate-spin` : ``} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.image_id || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {item.image_state || 'N/A'}
                                                        {
                                                            item.image_state ? (
                                                                <Tooltip title="Refresh" placement="top">
                                                                    <IconButton color="info" onClick={handleRefreshImageState(item.image_id, item.course_id, item.workspace_id)}>
                                                                        <RefreshOutlinedIcon className={spinnerLoading === item.image_id ? `animate-spin` : ``} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            ) : ''
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow key={`workspace-item-index-0`}>
                                                <td colSpan={5} className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                                                    No workspace details available
                                                </td>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </Modal>

            <BModal show={showBModal} onHide={() => { setBModal(false) }} backdrop="static" keyboard={false} size="lg" centered>
                <BModal.Header closeButton>
                    <BModal.Title>Course Details</BModal.Title>
                </BModal.Header>
                <BModal.Body className="px-2 pr-14">
                    <div className="no-scrollbar relative w-full max-w-[1200px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-4">
                        <div className="max-w-full overflow-x-auto">
                            <table className="min-w-full">
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>Start Date:</strong> {courseDetails?.start_date || 'N/A'}
                                        </td>
                                        <td>
                                            <strong>End Date:</strong> {courseDetails?.end_date || 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <strong>Course Description:</strong>
                                            <p>{courseDetails?.description}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </BModal.Body>
            </BModal>

            {rejectionModal?.open && (
                <div className="fixed inset-0 z-1 flex items-center justify-center rejection-modal" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-2">Reason for Rejection</h2>
                        <textarea
                            className="w-full border p-2 h-24 rounded"
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={rejectionModal.onCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded"
                                onClick={() => {
                                    if (!rejectionReason.trim()) return;
                                    rejectionModal.onConfirm(rejectionReason);
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}