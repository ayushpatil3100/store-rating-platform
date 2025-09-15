import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const AlertDialog = ({ open, handleClose, title, message, onConfirm, showCancel = true }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {showCancel && (
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        )}
        <Button onClick={handleConfirm} color="primary" autoFocus variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;