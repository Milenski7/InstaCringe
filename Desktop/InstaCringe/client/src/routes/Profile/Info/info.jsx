import React, { useState, useEffect } from 'react';
import * as config from '../../../config/config.json';
import http from '../../../services/http';
import { toast } from 'react-toastify';
import './info.css';

const Info = ({ match, curUserJWT }) => {
    const [profile, setProfile] = useState({});
    const [file, setFile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [curUser, setCurUser] = useState(null);
    const [bio, setBio] = useState('');

    const getProfile = async () => {
        const { data } = await http.get(`${config.apiEndpoint}/user/${match.params.id}`);
        setProfile(data);
    };
    const getCurUser = async () => {
        try {
            const { data } = await http.get(`${config.apiEndpoint}/user/cur-user/${curUserJWT._id}`);
            setCurUser(data);
        }
        catch (ex) { console.error(ex) };
    };

    const clickUploader = () => {
        document.getElementById('upload-photo').click();
    };

    const handleFileChange = e => {
        setFile(e.target.files[0]);
    };

    const handleProfilePicUpload = async () => {
        const fd = new FormData();
        fd.append('profilePic', file);
        try {
            await http.put(`${config.apiEndpoint}/user/profile-pic/${match.params.id}`, fd);
            setFile(null);
        } catch (ex) {
            console.error(ex);
            toast.error('Something went wrong while uploading profile pic.');
        }
    };

    const handleBioEdit = async () => {
        try {
            await http.put(`${config.apiEndpoint}/user/bio/${match.params.id}`, {
                bio: bio
            });
            setEditing(false);
            setBio('');
        } catch (ex) {
            console.error(ex);
            toast.error('Something went wrong while editing your Bio.');
        }
    };

    const handleBioChange = e => {
        setBio(e.target.value);
    }
    const handleUserFollow = async () => {
        const followedUser = [...curUser.following, profile.name];
        console.log(followedUser);
        const index = curUser.following.indexOf(profile.name);
        console.log(index);
        const removedUser = [...curUser.following];
        removedUser.splice(index, 1);
        console.log(removedUser);
        if (!curUser.following.includes(profile.name)) {
            try {
                await http.post(`${config.apiEndpoint}/user/following/${match.params.id}`, {
                    following: followedUser,
                    userId: curUser._id
                });
            } catch (ex) {
                console.log('Error detected when attempting to follow user.', ex);
            }
        }
        else {
            try {
                await http.post(
                    `${config.apiEndpoint}/user/following/${match.params.id}`,
                    {
                        following: removedUser,
                        userId: curUser._id
                    }
                );
            }
            catch (ex) {
                console.log('Error while attempting to unfollow user', ex);
            }
        }
    };

    const handleFollow = async () => {
        handleUserFollow();
        const prevFollows = profile.followingMe;
        const profileFollowers = [...profile.followingMe, curUser.name];
        const index = profile.followingMe.indexOf(curUser.name);
        const newFollowers = [...profile.followingMe];
        newFollowers.splice(index, 1);
        if (!profile.followingMe.includes(curUser.name)) {
            try {
                await http.post(
                    `${config.apiEndpoint}/user/following-me/${match.params.id}`,
                    { followingMe: profileFollowers }
                );
                window.location.reload();
            }
            catch (ex) {
                console.log('Error detected when attempting to follow user.', ex);
            }
        } else {
            try {
                await http.post(
                    `${config.apiEndpoint}/user/following-me/${match.params.id}`,
                    { followingMe: newFollowers }
                );
                window.location.reload();
            }
            catch (ex) {
                console.log('Error while attempting to unfollow user', ex);
            }
        }
    };

    const deleteProfile = async () => {
        try {
            await http.delete(`${config.apiEndpoint}/user/delete-profile/${profile._id}`);
            window.location.replace(`/logout`);
        } catch (ex) {
            console.error(ex);
            toast.error('Something went wrong while deleting this profile.');
        }
    };

    useEffect(() => {
        getProfile();
        getCurUser();
    }, [file, editing, curUserJWT]);

    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-left">
                    {profile.profilePic &&
                        <img src={`data:image/jpeg;base64,${new Buffer(profile.profilePic.data).toString('base64')}`} alt="profile-pic" className="profile-pic" />}
                    {!profile.profilePic &&
                        <img src={require('./upload.png')} alt="profile-pic" className="profile-pic" />}
                    {curUser && profile._id === curUser._id && (<React.Fragment><h1 onClick={clickUploader} className="profile-left-text">Upload Photo</h1>
                        <input onChange={handleFileChange} id="upload-photo" type="file" hidden /></React.Fragment>)}
                    {file && <button onClick={handleProfilePicUpload} className="upload-photo-btn">UPLOAD</button>}
                </div>
                <div className="profile-right">
                    <h1 className="profile-name">{profile.name}</h1>
                    {profile.photos && <div className="profile-right-counters">
                        <h1 className="profile-right-counter">Posts: {profile.photos.length}</h1>
                        <h1 className="profile-right-counter">Followers: {profile.followingMe.length}</h1>
                        <h1 className="profile-right-counter">Following: {profile.following.length}</h1>
                    </div>}
                    {!editing && (<React.Fragment>
                        <p className="profile-right-bio">{profile.bio}</p>
                        {curUser && profile._id === curUser._id && <button onClick={() => { setEditing(true); setBio(profile.bio) }} className="profile-right-bio-update">Edit Bio</button>}
                    </React.Fragment>)}
                    {editing && (<React.Fragment>
                        <textarea className="profile-text-area" maxLength={155} rows={4} cols={20} value={bio} onChange={handleBioChange} />
                        <button onClick={handleBioEdit} className="profile-right-bio-update">Confirm Edit</button>
                    </React.Fragment>)}
                    <div className="profile-right-buttons">
                        {curUser && curUser._id !== profile._id && !curUser.following.includes(profile.name) && <button onClick={handleFollow} className="profile-right-follow">Follow</button>}
                        {curUser && curUser._id !== profile._id && curUser.following.includes(profile.name) && <button onClick={handleFollow} className="profile-right-unfollow">Unfollow</button>}
                        {curUser && curUser._id === profile._id && <button onClick={deleteProfile} className="profile-right-delete">Delete Profile</button>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Info;