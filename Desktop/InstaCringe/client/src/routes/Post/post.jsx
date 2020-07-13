import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import http from '../../services/http';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeart2 } from '@fortawesome/free-regular-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import * as config from '../../config/config.json';
import './post.css';

const Post = ({ match, curUser }) => {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [text, setText] = useState('');
    const [likes, setLikes] = useState(null);
    const [comments, setComments] = useState(null);
    const handleTextChange = e => {
        setText(e.target.value);
    };
    const getPhoto = async () => {
        try {
            const { data } = await http.get(`${config.apiEndpoint}/user/modal/${match.params.id}/${match.params.image}`);
            setUser(data);
            setLoaded(true);
            setLikes(data.photo.likes);
            setComments(data.photo.comments);
        } catch (ex) {
            console.error(ex);
            toast.error('Something failed while loading post.');
            setLoaded(true);
        }
    };
    const getHeartIcon = () => {
        if (likes && likes.includes(curUser.name)) { return { icon: faHeart, color: 'red' } }
        else { return { icon: faHeart2, color: 'black' } };
    };

    const likePhoto = async () => {
        const prevLikes = [...likes];
        let newLikes = [...likes, curUser.name];
        let removeLikes = [...likes];
        let index = removeLikes.indexOf(curUser.name);
        removeLikes.splice(index, 1);
        if (!likes.includes(curUser.name)) {
            try {
                setLikes(newLikes);
                await http.put(`${config.apiEndpoint}/user/likes/${match.params.id}/${match.params.image}`, { likes: newLikes });
            } catch (ex) {
                console.error(ex);
                setLikes(prevLikes);
            }
        }
        else {
            try {
                setLikes(removeLikes);
                await http.put(`${config.apiEndpoint}/user/likes/${match.params.id}/${match.params.image}`, { likes: removeLikes });
            } catch (ex) {
                console.error(ex);
                setLikes(prevLikes);
            }
        }
    };

    const postComment = async () => {
        const prevComments = [...comments];
        const newComments = [...comments, { name: curUser.name, text: text }];
        try {
            setComments(newComments);
            setText('');
            await http.put(`${config.apiEndpoint}/user/comments/${match.params.id}/${match.params.image}`, { comments: newComments });
        } catch (ex) {
            console.error(ex);
            setComments(prevComments);
            setText('');
        }
    };

    const deleteComment = async (comment) => {
        const prevComments = [...comments];
        const newComments = [...comments];
        const index = prevComments.indexOf(comment);
        newComments.splice(index, 1);
        try {
            const prompted = window.confirm("Are you sure you want to delete comment?");
            if (prompted === true) {
                setComments(newComments);
                await http.put(`${config.apiEndpoint}/user/comments/${match.params.id}/${match.params.image}`, { comments: newComments });
            }
            else { return null }
        } catch (ex) {
            console.error(ex);
            setComments(prevComments);
        }
    };

    console.log(user);


    const deletePhoto = async () => {
        try {
            const prompted = window.confirm("Are you sure you want to delete this post?");
            if (prompted === true) {
                await http.delete(`${config.apiEndpoint}/user/delete-photo/${user.user._id}/${user.photo._id}`);
                window.location.replace(`/profile/${match.params.id}`);
            }
            else { return null };
        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        getPhoto();
    }, []);
    return (
        <div className="post-container">
            {!user && loaded && <h1 className="no-photo-found">This post is either deleted or could not be found.</h1>}
            {user && <div className="post">
                <img src={`data:image/jpeg;base64,${user.photo.data}`} className="post-photo" />
                <div className="post-right">
                    <div onClick={() => window.location.replace(`/profile/${match.params.id}`)} className="post-right-user-details">
                        <img
                            src={`data:image/jpeg;base64,${new Buffer(user.user.profilePic.data).toString('base64')}`}
                            className="post-right-user-photo" />
                        <h1 className="post-right-user-name">{user.user.name}</h1>
                    </div>
                    <img src={`data:image/jpeg;base64,${user.photo.data}`} className="post-photo-mobile" />
                    <div className="post-right-likes-container">
                        {curUser && <FontAwesomeIcon style={{ color: `${getHeartIcon().color}` }} onClick={likePhoto} icon={getHeartIcon().icon} className="post-right-like-icon" />}
                        {likes && likes.length === 0 &&
                            <h1 className="post-right-likes-text">Be the first one to like this post!</h1>}
                        {likes && likes.length === 1 &&
                            <h1 className="post-right-likes-text">1 like.</h1>}
                        {likes && likes.length > 1 &&
                            <h1 className="post-right-likes-text">{likes.length} likes.</h1>}
                    </div>
                    <div className="post-right-comments-container">
                        {comments && comments.map(comment => (
                            <div className="post-right-comment">
                                <h1 className="post-right-comment-username">{comment.name}:</h1>
                                <p className="post-right-comment-text">{comment.text}</p>
                                {curUser && comment.name === curUser.name && <button onClick={() => deleteComment(comment)} className="post-right-comment-delete">Delete</button>}
                            </div>
                        ))}
                        {comments && comments.length === 0 && <h1 className="post-right-no-comments">There are no comments yet.</h1>}
                    </div>
                    {curUser && (<div className="post-right-text-area-container">
                        <h1 className="post-right-text-area-header">Post your comment:</h1>
                        <textarea className="post-right-text-area" maxLength={255} rows={7} cols={20} value={text} onChange={handleTextChange} />
                        <button className="post-right-text-area-btn" onClick={postComment}>DONE</button>
                    </div>)}
                    {curUser && match.params.id === curUser._id && <button onClick={deletePhoto} className="delete-post-btn">DELETE POST</button>}
                    {!curUser && <h1 className="login-to-post-comment">You need to be logged in to post a comment.</h1>}
                </div>
            </div>}
        </div>
    );
};

export default Post;