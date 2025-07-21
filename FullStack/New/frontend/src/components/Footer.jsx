import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';

const Footer = () => {
    return (
        <Box component="footer" className="footer">
            <Divider />
            <Container maxWidth="lg">
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" className="footer-text">
                        © 2025 CBRE, Inc. All rights reserved.
                    </Typography>
                    <Typography variant="body2" className="footer-text" sx={{ mt: 1 }}>
                        Role Management System - Secure & Efficient
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
