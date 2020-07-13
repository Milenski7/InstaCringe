import React, { useState, useEffect } from 'react';
import http from '../../../services/http';
import * as config from '../../../config/config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faThumbsUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import './photos.css';

const Photos = ({ match, curUser, history }) => {
    const [photos, setPhotos] = useState(null);
    const [file, setFile] = useState(null);
    const getPhotos = async () => {
        try {
            const { data } = await http.get(`${config.apiEndpoint}/user/photos/${match.params.id}`);
            setPhotos(data.photos.reverse());
        } catch (ex) {
            console.error(ex);
            toast.error('Something went wrong while getting photos...');
        }
    };

    const handleFileChange = e => {
        setFile(e.target.files[0]);
    };
    const clickUploader = () => {
        document.getElementById('upload-photo-grid').click();
    }

    const uploadPhotoGrid = async () => {
        const fd = new FormData();
        fd.append('photo', file);
        try {
            await http.put(`${config.apiEndpoint}/user/grid-new/${match.params.id}`, fd);
            setFile(null);
        } catch (ex) {
            console.error(ex);
            toast.error('Something went wrong while uploading image.');
        }
    };

    const deletePhoto = async (photo) => {
        const prevPhotos = [...photos];
        const newPhotos = [...photos];
        const index = newPhotos.indexOf(photo);
        newPhotos.splice(index, 1);
        try {
            const prompted = window.confirm("Are you sure you want to delete this post?");
            if (prompted === true) {
                setPhotos(newPhotos);
                await http.delete(`${config.apiEndpoint}/user/delete-photo/${curUser._id}/${photo._id}`);
            }
            else { return null };
        } catch (ex) {
            console.error(ex);
            setPhotos(prevPhotos);
        }
    };

    useEffect(() => {
        getPhotos();
    }, [file]);

    return (
        <React.Fragment>
            <div className="photos-container">
                {!photos && (<React.Fragment><Loader type="ThreeDots" color="black" height={100} width={100} />
                    <h1 className="loading-photos">LOADING...</h1></React.Fragment>)}
                {photos && photos.length === 0 && <h1 className="no-posts">This user currently has no posts.</h1>}
                {photos && <div className="photos">
                    {curUser && !file && match.params.id === curUser._id && <div onClick={clickUploader} className="grid-upload-photo-container">
                        <FontAwesomeIcon icon={faCamera} className="grid-upload-photo-icon" />
                        <h1 className="grid-upload-photo-text">Upload Photo</h1>
                        <input id="upload-photo-grid" type="file" hidden onChange={handleFileChange} />
                    </div>}
                    {file && match.params.id === curUser._id && <div onClick={uploadPhotoGrid} className="grid-upload-photo-container2">
                        <FontAwesomeIcon icon={faThumbsUp} className="grid-upload-photo-icon2" />
                        <h1 className="grid-upload-photo-text2">Confirm Upload</h1>
                    </div>}
                    {photos.map(photo => (
                        <div className="image-container">
                            <img
                                key={photo._id}
                                onClick={() => history.push(`/profile/${match.params.id}/${photo._id}`)}
                                src={`data:image/jpeg;base64,${photo.data}`}
                                alt="grid-post"
                                className="grid-photo" />
                            {curUser && match.params.id === curUser._id && <FontAwesomeIcon onClick={() => deletePhoto(photo)} icon={faTimes} className="delete-photo-icon" />}
                        </div>
                    ))}
                </div>}
            </div>
        </React.Fragment>
    );
};

export default Photos;