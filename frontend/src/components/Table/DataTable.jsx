import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TableSortLabel, Box, Typography
} from '@mui/material';

const DataTable = ({
  data,
  columns,
  sort,
  onSort,
  onPageChange,
  onRowsPerPageChange,
  totalRows,
  rowsPerPageOptions = [5, 10, 25],
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const handleRequestSort = (property) => {
    if (onSort) {
        const isAsc = sort?.field === property && sort?.order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        onSort(property, newOrder);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    }
  };

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
        <Typography variant="h6" color="text.secondary">No data available.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="data table">
          <TableHead>
          <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold', bgcolor: 'grey.200' } }}>
          {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={sort?.field === column.id ? sort.order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                    active={sort?.field === column.id}
                    direction={sort?.field === column.id ? sort.order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={row.id || rowIndex}>
                {columns.map((column) => {
                  const value = column.render ? column.render(row) : row[column.id];
                  return (
                    <TableCell key={`${row.id}-${column.id}`} align={column.align || 'left'}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable;