"use client";

import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Button, CircularProgress } from "@mui/material";
import DataTable from "@/components/tables/DataTable";
import { fetchData } from "@/helpers/apiHelper";
import { Switch, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotification } from '@/context/NotificationContext';
import { API_BASE_URL } from "@/components/config/config";
import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';
import { useConfirmation } from "@/context/ConfirmationContext";
export default function UserListing() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification()
  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [mainloading, setMainLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState<string>("");
  const { confirm } = useConfirmation();
  const isMountedRef = useRef(true); // To prevent memory leaks
  const [currentPage, setCurrentPage] = useState(0);

  const fetchTableData = useCallback(async () => {
    setMainLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      const response = await fetchData(`${API_BASE_URL}/api/v1/admin/get-users?role=STUDENT&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&search=${searchText}`, token)
      if (response?.error) {
        if (response?.error == 'Invalid or expired token') {
          return
        }
        showNotification('', "Failed to load users. Please try again later.", "error");
        return;
      }
      if (isMountedRef.current && response?.data) {
        setRows(response.data?.data ?? []);
        if (response.data?.pagination) {
          setRowCount(response.data.pagination.totalCount)
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        showNotification("Failed to load users. Please try again later.", "error");
      }
    } finally {
      if (isMountedRef.current) {
        setMainLoading(false);
      }
      // setLoading(false);
    }
  }, [paginationModel, searchText]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const columns: GridColDef[] = [
    {
      field: "serial",
      headerName: "Sr. No",
      width: 90,
      sortable: false,
      // flex: 1
    },
    { field: "fullName", headerName: "User", width: 150, sortable: false, flex: 1 },
    { field: "email", headerName: "Email", width: 200, sortable: false, flex: 1 },
    { field: "awsApproved", headerName: "Verification", width: 200, sortable: false, flex: 1 },
    { field: "phoneNumber", headerName: "Phone", width: 150, sortable: false, flex: 1 },
    { field: "createdBy", headerName: "Created By", width: 150, sortable: false, flex: 1 },
    {
      field: "createdAt",
      headerName: "Creation Date",
      width: 150,
      sortable: false,
      flex: 1
    },
    {
      field: "approved",
      headerName: "Approve",
      width: 100,
      sortable: false,
      // flex: 1,
      renderCell: (params) => {
        const handleToggle = async (event: ChangeEvent<HTMLInputElement>) => {
          const newChecked = event.target.checked;
          const newStatus = newChecked ? "active" : "suspended";

          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/status-change`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId: params.id,
                status: newStatus,
              }),
            });

            const result = await response.json();
            if (!response.ok) {
              showNotification("Error", result.message || "Failed to update status", "error");
              return;
            }
            // Update local state so Switch reflects the new value instantly
            setRows((prevRows) =>
              prevRows.map((row) =>
                row.id === params.id ? { ...row, isApproved: newStatus } : row
              )
            );

            // showNotification("Success", "Status updated successfully", "success");
          } catch (error) {
            showNotification("Error", "Failed to update status", "error");
          } finally {
            setLoading(false);
          }
        };

        return (
          <Tooltip
            title={params.row.isApproved === "active" ? "Disapprove Account" : "Approve Account"}
            placement="top"
          >
          <Switch
            checked={params.row.isApproved === "active"}
            onChange={handleToggle}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#2E7D32',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#2E7D32',
              },
            }}
          />
          </Tooltip>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      // flex: 1,
      renderCell: (params) => {
        const handleDelete = async () => {
          const confirmed = await confirm({ message: 'Are you sure you want to delete this student?' });
          if (!confirmed) return;

          try {
            setLoading(true);
            const token = localStorage.getItem('token'); // adjust based on your auth flow
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete-user?userId=${params.id}&rolename=STUDENT`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            const result = await response.json();
            if (!response.ok) {
              showNotification(
                'Error.',
                'Failed to delete user!',
                'error'
              );
              throw new Error(result.message || "Failed to delete user");
            }

            showNotification(
              'Success.',
              'User Deleted Successfully!',
              'success'
            );
            fetchTableData(); // Refresh the table data after deletion
            // Optionally refresh table data here (maybe via a prop callback or refetch trigger)
          } catch (error) {
            showNotification(
              'Error.',
              'Failed to delete user',
              'error'
            );
            console.error("Error deleting user:", (error as Error).message);
          } finally {
            setLoading(false);
          }
        };

        return (
          <>
            <Tooltip title="Edit">
              <IconButton
                sx={{ color: '#633793' }}
                onClick={() => router.push(`/admin/user/${params.row.id}`)}
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
          </>
        );
      }
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowCount={rowCount}
      loading={mainloading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      onQueryChange={fetchTableData}
      is_show_button={true}
      button_text="Add New Student"
      button_link="/admin/user/add"
    />
  );
}
