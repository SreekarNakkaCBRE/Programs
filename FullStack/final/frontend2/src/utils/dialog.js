import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { colors } from './colors';

/**
 * Reusable confirmation dialog component
 * @param {Object} props - Dialog properties
 * @param {boolean} props.open - Whether dialog is open
 * @param {function} props.onClose - Function to call when dialog is closed
 * @param {function} props.onConfirm - Function to call when confirmed
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 */
export function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) {
    return (
        <Dialog
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '12px',
                    backgroundColor: colors.secondary.lightGreen,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    minWidth: '400px',
                },
            }}
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
        >
            <DialogTitle id="confirmation-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    sx={{
                        marginRight: '8px',
                        backgroundColor: colors.secondary.mediumGreen,
                        color: colors.white,
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: colors.secondary.darkGray,
                        },
                        borderRadius: '8px',
                    }}
                    onClick={onClose}
                    color="secondary"
                >
                    {cancelText}
                </Button>
                <Button
                    sx={{
                        marginRight: '8px',
                        backgroundColor: colors.primary.brightGreen,
                        color: colors.white,
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: colors.primary.darkGreen,
                        },
                        borderRadius: '8px',
                    }}
                    onClick={onConfirm}
                    color="primary"
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
