import React, { useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Search from '../SearchBar/search';
import './navbar.css';

const Navbar = ({ curUser, history }) => {
    const [x, setX] = useState(150);
    return (
        <React.Fragment>
            <div className='navbar'>
                <div onClick={() => history.push("/")} className="navbar-brand">
                    <img src={require('./logo.png')} alt="brand-logo" className="nav-logo" />
                    <h1 className="nav-brand-text">InstaCringe</h1>
                </div>
                <div className="nav">
                    <FontAwesomeIcon onClick={() => setX(0)} icon={faSearch} className="search-icon" />
                    {!curUser && <Link to="/login" className="nav-link">My Profile</Link>}
                    {curUser && <div onClick={() => window.location.replace(`/profile/${curUser._id}`)} className="nav-link">My Profile</div>}
                    {!curUser && <Link to="/login" className="nav-link">Login</Link>}
                    {curUser && <Link to="/logout" className="nav-link">Logout</Link>}
                </div>
            </div>
            <Search x={x} setX={setX} />
        </React.Fragment>
    );
};

export default withRouter(Navbar);