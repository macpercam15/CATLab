import React, { useState, useEffect } from 'react';
import {
    Navbar,
    NavbarBrand,
    NavLink,
    NavItem,
    Nav,
    NavbarText,
    NavbarToggler,
    Collapse,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
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
    const getInitial = (name) => (name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : "U");
    const getPastelColor = (name) => {
        const key = name || "user";
        let hash = 0;
        for (let i = 0; i < key.length; i += 1) {
            hash = key.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 60%, 78%)`;
    };

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
    let userMenu = <></>;
    let publicLinks = <></>;
    let publicLeftLinks = <></>;

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
        publicLeftLinks = (
            <>
                <NavItem>
                    <NavLink
                        style={{
                            color: "white",
                            fontSize: "1.8rem",
                            fontFamily: "Anonymous Pro"
                        }}
                        id="about"
                        tag={Link}
                        to="/about">
                        About
                    </NavLink>
                </NavItem>
            </>
        )
        publicLinks = (
            <>
                <NavItem>
                    <NavLink
                        style={{
                            color: "white",
                            fontSize: "1.8rem",
                            fontFamily: "Anonymous Pro"
                        }}
                        id="github"
                        href="https://github.com/macpercam15/CATLab"
                        target="_blank"
                        rel="noreferrer">
                        <img alt="github" src={require('./static/images/logo-github.png')} style={{ height: 40, width: 40, marginRight: 10 }} />
                        GitHub
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        style={{
                            color: "white",
                            fontSize: "1.8rem",
                            fontFamily: "Anonymous Pro"
                        }}
                        id="login"
                        tag={Link}
                        to="/login">
                        Login
                    </NavLink>
                </NavItem>
            </>
        )
    } else {
        userLinks = (
            <>
                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle
                        nav
                        style={{ color: "white", fontSize: "2rem", fontFamily: "Anonymous Pro" }}>
                        Menu
                    </DropdownToggle>
                    <DropdownMenu end>
                        {adminLinks}
                        {studentLinks}
                        {teacherLinks}
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to="/docs">Docs</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </>
        )
        userMenu = (
            <>
                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle
                        nav
                        style={{ color: "white", fontSize: "2rem", fontFamily: "Anonymous Pro", fontWeight: "bold" }}>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px"
                            }}>
                            <span
                            /*Esto en un futuro segurametne lo tendre que quitar y poerle que los usuarios tenga foto de perfil*/
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: getPastelColor(username),
                                    color: "#0F766E",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.1rem",
                                    fontWeight: "bold"
                                }}>
                                {getInitial(username)}
                            </span>
                            <span>{username}</span>
                        </span>
                    </DropdownToggle>
                    <DropdownMenu end>
                        <DropdownItem disabled>Perfil (proximamente)</DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to="/logout">Logout</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
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
                        {publicLeftLinks}
                        {userLinks}
                    </Nav>
                    <Nav className="ms-auto mb-2 mb-lg-0" navbar>
                        {publicLinks}
                        {userMenu}
                    </Nav>
                </Collapse>
            </Navbar>
        </div>
    );
}

export default AppNavbar;