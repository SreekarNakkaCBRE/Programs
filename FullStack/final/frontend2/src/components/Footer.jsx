import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';

function Footer() {
    useAuth();

    return (
        <footer style={footerStyles}>
            <div style={footerContentStyles}>
                <p style={footerText}>&copy; 2025 Role Management Dashboard. All rights reserved.</p>
                <div style={footerLinksStyles}>
                    <a href="https://www.cbre.com/about-us/global-web-privacy-and-cookie-policy" target='_blank' style={linkStyles}>Privacy Policy</a>
                    <a href="https://www.cbre.com/about-us/disclaimer-terms-of-use" target='_blank' style={linkStyles}>Terms of Service</a>
                    <a href="https://www.cbre.com/about-us/culture-and-history/contact-us" target='_blank' style={linkStyles}>Contact</a>
                </div>
            </div>
        </footer>
    );
}

const footerStyles = {
    backgroundColor: colors.primary.gray,
    color: colors.white,
    padding: '1px',
    marginTop: 'auto',
    position: 'relative',
    bottom: 0,
    width: '100%'
};

const footerText = {
    marginLeft: "120px"
};

const footerContentStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    fontSize: '0.9rem'
};

const footerLinksStyles = {
    display: 'flex',
    gap: '1rem'
};

const linkStyles = {
    color: colors.secondary.lightGreen,
    textDecoration: 'none'
};

export default Footer;
