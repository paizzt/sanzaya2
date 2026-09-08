import logo from '../assets/logo.png';

export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src={logo}
            alt="Application Logo"
        />
    );
}
