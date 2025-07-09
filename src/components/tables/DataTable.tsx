"use client";

import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { Box, TextField, Typography } from "@mui/material";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
interface ServerDataTableProps {
  columns: GridColDef[];
  rows: any[];
  rowCount: number;
  loading?: boolean;
  onQueryChange: (params: {
    page: number;
    pageSize: number;
    searchText: string;
  }) => void;
  searchText: string;
  searchPlaceholder?: string;
  onSearchTextChange: (val: string) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  title?: string;
  is_show_button?: boolean,
  button_text: string,
  button_link: string
}

export default function DataTable({
  columns,
  rows,
  rowCount,
  loading = false,
  onQueryChange,
  searchText,
  onSearchTextChange,
  searchPlaceholder='Search...',
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  initialPageSize = 10,
  title = "",
  is_show_button,
  button_text,
  button_link
}: ServerDataTableProps) {
  const [getScreenWidth, setGetScreenWidth] = useState<number>(1600);
  useEffect(() => {
    let isMounted = true;
    setGetScreenWidth(window.innerWidth - 375);

    const runQueryChange = async () => {
      if (isMounted) {
        onQueryChange({
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          searchText,
        });
      }
    };

    runQueryChange();

    return () => {
      isMounted = false;
    };
  }, [paginationModel, searchText, onQueryChange]);
  const NoRowsOverlay = () => (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        color: '#888',
      }}
    >
      No records found.
    </Box>
  );
  return (
    <Box>
      <Box className="flex justify-between items-center mb-4" sx={{ width: '100%', overflowX: 'auto' }}>
        {/* <Typography variant="h6">{title}</Typography> */}

        <TextField
          size="small"
          variant="outlined"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
        />
        {is_show_button && (
          <Link href={button_link}>
            <Button size="sm" className="text-sm font-medium" variant="primary">
              {button_text}
            </Button>
          </Link>
        )}
      </Box>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box
          sx={{
            width: { xs: '100%', md: '90%', lg: getScreenWidth }, // Responsive width
            maxWidth: '100%',
            overflowX: 'auto',
          }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={onPaginationModelChange}
            pageSizeOptions={pageSizeOptions}
            sx={{
              width: '100%',
              minWidth: '800px',
              '& .MuiDataGrid-virtualScroller': {
                overflowX: 'auto',
              },
              '& .MuiDataGrid-filler': { display: 'none' },
              '& .MuiDataGrid-scrollbarFiller': { display: 'none' },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
            }}
            slots={{
              noRowsOverlay: NoRowsOverlay,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}