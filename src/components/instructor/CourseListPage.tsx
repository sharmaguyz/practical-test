"use client";
import DataTable from "@/components/tables/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNotification } from '@/context/NotificationContext';
import { fetchData } from "@/helpers/apiHelper";
import { API_BASE_URL } from "../config/config";
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useLoading } from '@/context/LoadingContext';
import { useConfirmation } from "@/context/ConfirmationContext";
import { useRouter } from 'next/navigation';
import { getLoggedInUser } from "@/helpers/authHelper";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { formatDuration } from "@/helpers/commonHelper";
import VisibilityIcon from '@mui/icons-material/Visibility';
export default function CourseListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const { setLoading } = useLoading();
  const [rowCount, setRowCount] = useState(0);
  const [mainloading, setMainLoading] = useState(false);
  const { showNotification } = useNotification();

  const [spinnerLoading, setSpinnerLoading] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceItems, setWorkspaceItems] = useState([]);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const isMountedRef = useRef(true);
  const [searchText, setSearchText] = useState<string>("");
  const { confirm } = useConfirmation();
  const columns: GridColDef[] = [
    {
      field: "serial",
      headerName: "Sr. No",
      width: 90,
      sortable: false,
    },
    {
      field: "courseName", // FIXED: was "Course"
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
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return (<span>${params.row.price}</span>);
      }
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
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return formatDuration(params.row.courseDuration);
      }
    },
    {
      field: "operatingSystem",
      headerName: "Operating Workspace",
      width: 60,
      sortable: false,
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 60,
      sortable: false,
    },
    {
      field: "isApproved",
      headerName: "Status",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        let selectedStatus;
        let isPublished = false;
        const statusObj = {
          'pending': { label: 'Pending', color: 'bg-blue-500 text-white px-2 py-1 rounded', tooltip: 'Your course is under review. We will get back to you shortly.' },
          'completed': { label: 'Approved', color: 'bg-green-500 text-white px-2 py-1 rounded', tooltip: 'Your course is approved.' },
          'rejected': { label: 'Rejected', color: 'bg-red-500 text-white px-2 py-1 rounded', tooltip: 'Your course is rejected by admin.' },
        }

        const publishObj = {
          'pending': { label: 'Awaiting', color: 'bg-blue-500 text-white px-2 py-1 rounded', tooltip: 'Your publication request is pending. We will get back to you soon.' },
          'completed': { label: 'Published', color: 'bg-green-500 text-white px-2 py-1 rounded', tooltip: 'Your course is published.' },
          'rejected': { label: 'Rejected', color: 'bg-red-500 text-white px-2 py-1 rounded', tooltip: 'Your publication request is rejected by admin.' },
        }

        if (params.row.isApproved === "completed" && ['pending', 'completed', 'rejected'].includes(params?.row?.published)) {
          type StatusKey = keyof typeof publishObj;
          selectedStatus = publishObj[params.row.published as StatusKey];
          isPublished = true;
        } else {
          type StatusKey = keyof typeof statusObj;
          selectedStatus = statusObj[params.row.isApproved as StatusKey];
        }
        
        const handleShowReason = () => {
          showNotification(`Reason for Rejection`, params.row.reason || 'No reason provided', 'info');
        };

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

        return (
          isPublished ? (
            <Tooltip key={`tool-tip-index-0`} title={selectedStatus.tooltip}>
              <div key={`tool-tip-child-index-0`}>
                <span className={selectedStatus.color}>{selectedStatus.label}</span>
                {params.row.published !== 'pending' && (
                  <IconButton
                    size="small"
                    onClick={params.row.published === 'completed' ? handleShowDetails : handleShowReason}
                    sx={{ marginLeft: 1, color: '#000' }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            </Tooltip>
          ) : (
            <Tooltip key={`tool-tip-index-0`} title={selectedStatus.tooltip}>
              <div key={`tool-tip-child-index-0`}>
                <span className={selectedStatus.color}>{selectedStatus.label}</span>
                {params.row.isApproved !== 'pending' && (
                  <IconButton
                    size="small"
                    onClick={params.row.isApproved === 'completed' ? handleShowDetails : handleShowReason}
                    sx={{ marginLeft: 1, color: '#000' }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            </Tooltip>
          )

        );
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      // flex: 1,
      renderCell: (params) => {
        const handleDelete = async () => {
          const confirmed = await confirm({ message: 'Are you sure you want to delete this course?' });
          if (!confirmed) return;

          try {
            setLoading(true);
            const { token, IdToken, AccessToken } = getLoggedInUser();
            const response = await fetch(`${API_BASE_URL}/api/v1/instructor/courses/delete-course/${params.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-ID-TOKEN": IdToken || "",
                "X-ACCESS-TOKEN": AccessToken || "",
              },
            });
            const result = await response.json();
            if (!response.ok) {
              showNotification(
                'Error.',
                'Failed to delete user!',
                'error'
              );
              throw new Error(result.message || "Failed to delete course");
            }

            showNotification(
              'Success.',
              'Course Deleted Successfully!',
              'success'
            );
            fetchTableData(); // Refresh the table data after deletion
            // Optionally refresh table data here (maybe via a prop callback or refetch trigger)
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
        const handleDetails = async () => {
          return router.push(`/instructor/course-details/${params.row.id}`)
        }
        return (
          <>
            <Tooltip title="Edit">
              <IconButton
                sx={{ color: '#633793' }}
                onClick={() => router.push(`/instructor/edit-course/${params.row.id}`)}
              >
                <EditIcon />
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
            <Tooltip title="View Details">
              <IconButton color="info" onClick={handleDetails}>
                <VisibilityIcon />
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
      const { token, IdToken, AccessToken } = getLoggedInUser();
      if (!token || !IdToken || !AccessToken) {
        return;
      }
      const response: any = await fetchData(
        `${API_BASE_URL}/api/v1/instructor/courses?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&search=${searchText}`,
        token,
        IdToken,
        AccessToken
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

  const fetchWorkspaceDetails = async (courseId: string) => {
    try {
      const { token, IdToken, AccessToken } = getLoggedInUser();
      const response = await fetch(`${API_BASE_URL}/api/v1/instructor/course-workspace/${courseId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-ID-TOKEN": IdToken || "",
          "X-ACCESS-TOKEN": AccessToken || "",
        },
      });

      const result = await response.json();
      const workspaceDetails = result?.data?.workspaces;
      setWorkspaceItems(workspaceDetails || []);
    } catch (error) {
      showNotification("Error", "Failed to load workspace details", "error");
    }
  };

  const handleRefreshState = (workspaceId: string, courseId: string) => async () => {
    setSpinnerLoading(workspaceId);
    const { token, IdToken, AccessToken } = getLoggedInUser();
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/instructor/workspace/${workspaceId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-ID-TOKEN": IdToken || "",
          "X-ACCESS-TOKEN": AccessToken || "",
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
        searchPlaceholder="Search Course"
        onSearchTextChange={setSearchText}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onQueryChange={() => { }}
        is_show_button={true}
        button_text="Add New Course"
        button_link="/instructor/add-course"
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
                      Status
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
    </>
  );
}