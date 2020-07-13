import React, { useState, useEffect } from 'react';
import http from '../../../services/http';
import * as config from '../../../config/config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeart2 } from '@fortawesome/free-regular-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import './feed.css';


const Feed = ({ history, curUser, date }) => {
    const [users, setUsers] = useState(null);
    const [slice, setSlice] = useState(5);
    const [showLoad, setShowLoad] = useState(true);

    const getUsers = async (end) => {
        try {
            if (curUser._id) {
                const { data } = await http.get(`${config.apiEndpoint}/user/get-followers/new/${curUser._id}`);
                data.map(user => {
                    user.photos.reverse();
                });
                const newPhotos = [];
                data.map(user => {
                    user.photos.map(photo => {
                        let curPhoto = {
                            profilePic: user.profilePic.data,
                            name: user.name,
                            userId: user._id,
                            data: photo.data,
                            contentType: photo.contentType,
                            likes: photo.likes,
                            date: photo.date,
                            comments: photo.comments,
                            photoId: photo._id
                        };
                        newPhotos.push(curPhoto);
                    })
                });
                newPhotos.sort((a, b) => a.date - b.date);
                newPhotos.reverse();
                if (slice >= newPhotos.length) { setShowLoad(false) };
                const slicedPhotos = newPhotos.slice(0, end);
                setUsers(slicedPhotos);
            }
            else { return }
        } catch (ex) {
            console.error('Something went wrong while getting feed.');
        }
    };

    const getAgeOfPhoto = (photo) => {
        const milliSeconds = date - photo.date;
        const seconds = Math.round(milliSeconds * 0.001);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(seconds / 3600);
        const days = Math.round(seconds / 86400);
        if (seconds < 60) { return `posted ${seconds} seconds ago.` }
        else if (seconds > 60 && seconds < 3600) { return `posted ${minutes} minutes ago.` }
        else if (seconds > 3600 && hours < 24 && hours === 1) { return `posted ${hours} hour ago.` }
        else if (seconds > 3600 && hours < 24) { return `posted ${hours} hours ago.` }
        else if (seconds > 86400 && hours > 24) { return `posted ${days} days ago.` }
    };

    const handleLoadMore = (num) => {
        setSlice(num);
    };

    const likePhoto = async (photo) => {
        if (!photo.likes.includes(curUser.name)) {
            let prevUsers = [...users];
            let curUsers = [...users];
            let curPhotoLikes = [...photo.likes];
            let newLikes = [...curPhotoLikes, curUser.name];
            const index = curUsers.indexOf(photo);
            curUsers[index].likes = newLikes;
            try {
                setUsers(curUsers);
                await http.put(`${config.apiEndpoint}/user/likes/${photo.userId}/${photo.photoId}`, { likes: newLikes });
            } catch (ex) {
                console.error(ex);
                setUsers(prevUsers);
            }
        }
        else {
            let prevUsers = [...users];
            let removeLikes = [...photo.likes];
            const userIndex = removeLikes.indexOf(curUser.name);
            removeLikes.splice(userIndex, 1);
            let newUsers = [...users];
            let index = newUsers.indexOf(photo);
            newUsers[index].likes = removeLikes;
            try {
                setUsers(newUsers);
                await http.put(`${config.apiEndpoint}/user/likes/${photo.userId}/${photo.photoId}`, { likes: removeLikes });
            } catch (ex) {
                console.error(ex);
                setUsers(prevUsers);
            }
        }
    };

    useEffect(() => {
        getUsers(slice);
    }, [curUser, slice]);

    return (
        <div className="home-container">
            {users && users.length === 0 && <h1 className="no-users-followed">You are currently not following anyone.</h1>}
            {!users && !curUser && <h1 className="no-users-followed">You are currently not logged in.</h1>}
            {!users && curUser && (<React.Fragment><Loader type="ThreeDots" color="black" height={100} width={100} />
                <h1 className="loading-photos">LOADING...</h1></React.Fragment>)}
            <div className="home-feed">
                {users && users.length > 0 && users.map(photo => (
                    <div key={photo.photoId} className="feed-item">
                        <div className="feed-item-header">
                            <img src={`${config.apiEndpoint}/user/photo/${photo.userId}`}
                                alt="profile-pic" className="feed-item-profilePic"
                                onClick={() => { window.location.replace(`/profile/${photo.userId}`) }} />
                            <h1 className="feed-item-name" onClick={() => { window.location.replace(`/profile/${photo.userId}`) }}>{photo.name}</h1>
                        </div>
                        <img
                            src={`data:image/jpg;base64,${photo.data}`}
                            alt="post" className="feed-item-photo"
                            onClick={() => { history.push(`/profile/${photo.userId}/${photo.photoId}`) }} />
                        <div className="feed-likes-container">
                            <FontAwesomeIcon onClick={() => likePhoto(photo)} icon={photo.likes.includes(curUser.name) === true ? faHeart : faHeart2} className="heart-icon" />
                            <h1 className="feed-likes-counter">{photo.likes.length}</h1>
                        </div>
                        <p className="date-since">{getAgeOfPhoto(photo)}</p>
                    </div>
                ))
                }
            </div>
            {showLoad && users && users.length !== 0 && <button className="load-more" onClick={() => handleLoadMore(slice + 5)}>LOAD MORE</button>}
        </div >
    );
};

export default Feed;