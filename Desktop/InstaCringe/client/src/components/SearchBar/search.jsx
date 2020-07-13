import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import http from '../../services/http';
import * as config from '../../config/config.json';
import { toast } from 'react-toastify';
import './search.css';

const Search = ({ x, setX }) => {
    const [text, setText] = useState('');
    const [users, setUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const handleChange = e => setText(e.target.value);
    const getUsernames = async () => {
        try {
            const { data } = await http.get(`${config.apiEndpoint}/user/usernames`);
            setUsers(data);
        } catch (ex) {
            console.error(ex);
            toast.error("Something went wrong while getting users...");
        }
    };
    const getSearchUsers = () => {
        let usernames = [...users];
        let newUsernames = [];
        usernames.map(i => {
            if (i.name.includes(text)) {
                newUsernames.push(i);
            }
            if (text.length === 0) {
                newUsernames = [];
            }
        });
        setNewUsers(newUsernames);
    };
    useEffect(() => {
        getUsernames();
        getSearchUsers();
    }, [text]);

    return (
        <div style={{ transform: `translateX(${x}%)` }} className="search-container">
            <div className="search-box">
                <label className="search-box-label" htmlFor="search">Find Users</label>
                <input
                    name="search"
                    className="search-box-input"
                    type="text"
                    placeholder="Type something here..."
                    value={text}
                    onChange={handleChange} />
                <div className="search-box-users">
                    {newUsers.length === 0 && <h1 className="search-box-no-users">No users found...</h1>}
                    {newUsers.length > 0 && newUsers.map(user => (
                        <div onClick={() => window.location.replace(`/profile/${user._id}`)} key={user._id} className="search-box-user">
                            {user.profilePic && <img src={`data:image/jpeg;base64,${new Buffer(user.profilePic.data).toString('base64')}`} className="search-box-user-pic" />}
                            {!user.profilePic && <img src={require('./upload.png')} className="search-box-user-pic" />}
                            <h1 className="search-box-user-name">{user.name}</h1>
                        </div>
                    ))}
                </div>
            </div>
            <FontAwesomeIcon onClick={() => { setX(150); setText('') }} icon={faTimes} className="search-box-arrow" />
        </div>
    );
};

export default Search;