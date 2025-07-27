import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { colors } from '../utils/colors';

function Layout({ children }) {
    return (
        <div style={layoutStyles}>
            <Header />
            <div style={mainContainerStyles} className="main-container">
                <Sidebar />
                <main style={contentStyles} className="content">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
}

const layoutStyles = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.secondary.lightGreen,
    overflow: 'hidden'
};

const mainContainerStyles = {
    display: 'flex',
    flex: 1,
    paddingTop: '80px', // Account for fixed header
    overflow: 'hidden'
};

const contentStyles = {
    flex: 1,
    marginLeft: '250px', // Account for fixed sidebar
    padding: '2rem',
    backgroundColor: colors.secondary.lightGreen,
    minHeight: 'calc(100vh - 160px)', // Adjust for header and footer
    boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
    overflow: 'auto',
    boxSizing: 'border-box',
    '@media (max-width: 768px)': {
        marginLeft: '0',
        padding: '1rem'
    }
};

export default Layout;
