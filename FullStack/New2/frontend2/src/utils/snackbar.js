import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

export const showSnackbar = (enqueueSnackbar, message, type = 'success') => {
    const config = {
        success: {
            variant: 'success',
            autoHideDuration: 3000,
            style: {
                backgroundColor: '#4caf50',
                color: '#fff',
                fontWeight: '500',
            },
            iconVariant: {
                success: <CheckCircle style={{ marginRight: 8 }} />
            }
        },
        error: {
            variant: 'error',
            autoHideDuration: 5000,
            style: {
                backgroundColor: '#f44336',
                color: '#fff',
                fontWeight: '500',
            },
            iconVariant: {
                error: <Error style={{ marginRight: 8 }} />
            }
        },
        info: {
            variant: 'info',
            autoHideDuration: 4000,
            style: {
                backgroundColor: '#2196f3',
                color: '#fff',
                fontWeight: '500',
            },
            iconVariant: {
                info: <Info style={{ marginRight: 8 }} />
            }
        },
        warning: {
            variant: 'warning',
            autoHideDuration: 4000,
            style: {
                backgroundColor: '#ff9800',
                color: '#fff',
                fontWeight: '500',
            },
            iconVariant: {
                warning: <Warning style={{ marginRight: 8 }} />
            }
        }
    };

    const snackbarConfig = {
        ...config[type],
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
        }
    };

    enqueueSnackbar(message, snackbarConfig);
};


export const showSuccess = (enqueueSnackbar, message) => showSnackbar(enqueueSnackbar, message, 'success');
export const showError = (enqueueSnackbar, message) => showSnackbar(enqueueSnackbar, message, 'error');
export const showInfo = (enqueueSnackbar, message) => showSnackbar(enqueueSnackbar, message, 'info');
export const showWarning = (enqueueSnackbar, message) => showSnackbar(enqueueSnackbar, message, 'warning');
