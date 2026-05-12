import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavLink, NavItem, Nav, NavbarText, NavbarToggler, Collapse } from 'reactstrap';
import { Link } from 'react-router-dom';
import tokenService from './services/token.service';
import jwt_decode from "jwt-decode";
import logo from './static/images/logo-blanco.png';

function AppNavbar() {
    const [roles, setRoles] = useState([]);
    const [username, setUsername] = useState("");
    const jwt = tokenService.getLocalAccessToken();
    const [collapsed, setCollapsed] = useState(true);

    const toggleNavbar = () => setCollapsed(!collapsed);

    useEffect(() => {
        if (jwt) {
            setRoles(jwt_decode(jwt).authorities);
            setUsername(jwt_decode(jwt).sub);
        }
    }, [jwt])

    let adminLinks = <></>;
    let studentLinks = <></>;
    let teacherLinks = <></>;
    let userLinks = <></>;
    let userLogout = <></>;
    let publicLinks = <></>;

    roles.forEach((role) => {
        if (role === "ADMIN") {
            adminLinks = (
                <>
                    <NavItem>
                        <NavLink style={{ color: "white" }} tag={Link} to="/users">Users</NavLink>
                    </NavItem>
                </>
            )
        }
        if (role === "ESTUDIANTE") {
            studentLinks = (
                <>
                </>
            )
        }
        if (role === "PROFESOR") {
            teacherLinks = (
                <>
                </>
            )
        }
    })

    if (!jwt) {
        publicLinks = (
            <>
                <NavItem>
                    <NavLink style={{ 
                        color: "white", 
                        fontSize: "1.8rem", 
                        fontFamily: "Anonymous Pro" 
                    }} 
                    id="docs" 
                    tag={Link} 
                    to="https://github.com/macpercam15/CATLab">
                        <img alt="github" src={require('./static/images/logo-github.png')} style={{ height: 40, width: 40, marginRight: 10 }} />
                        GitHub
                    </NavLink> 
                </NavItem>
                <NavItem>
                    <NavLink style={{ 
                        color: "white", 
                        fontSize: "1.8rem", 
                        fontFamily: "Anonymous Pro" 
                    }} id="login" tag={Link} to="/login">Login</NavLink>
                </NavItem>
            </>
        )
    } else {
        userLinks = (
            <>
            </>
        )
        userLogout = (
            <>
                <NavItem>
                    <NavLink style={{ color: "white", fontSize: "1.5rem", fontFamily: "Anonymous Pro", fontWeight: "bold" }} id="docs" tag={Link} to="/docs">Docs</NavLink>
                </NavItem>
                <NavbarText style={{ color: "white", fontSize: "1.5rem", fontFamily: "Anonymous Pro", fontWeight: "bold" }} className="justify-content-end">{username}</NavbarText>
                <NavItem className="d-flex">
                    <NavLink style={{ color: "white", fontSize: "1.5rem", fontFamily: "Anonymous Pro", fontWeight: "bold" }} id="logout" tag={Link} to="/logout">Logout</NavLink>
                </NavItem>
            </>
        )

    }

    return (
        <div>
            <Navbar expand="md" dark 
                style={{backgroundColor: '#0F766E',
                        paddingLeft: "3px",
                        paddingRight: "3px",
                        paddingTop: "3px",
                        paddingBottom: "3px",
                        fontFamily: "'Anonymous Pro', monospace"}}>
                <NavbarBrand href="/"
                    style={{ 
                        color: "white", 
                        fontSize: "2.8rem", 
                        fontWeight: "bold", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        fontFamily: "'Anonymous Pro', monospace" 
                    }}>
                    <img alt="logo" src={logo} style={{ height: 70, width: 70 }} />
                    CATLab
                </NavbarBrand>
                <NavbarToggler onClick={toggleNavbar} className="ms-2" />
                <Collapse isOpen={!collapsed} navbar>
                    <Nav className="me-auto mb-2 mb-lg-0" navbar>
                        {userLinks}
                        {adminLinks}
                        {studentLinks}
                        {teacherLinks}
                    </Nav>
                    <Nav className="ms-auto mb-2 mb-lg-0" navbar>
                        {publicLinks}
                        {userLogout}
                    </Nav>
                </Collapse>
            </Navbar>
        </div>
    );
}

export default AppNavbar;