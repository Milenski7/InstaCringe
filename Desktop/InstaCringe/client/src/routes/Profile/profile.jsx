import React from 'react';
import Info from './Info/info';
import Photos from './Photos/photos';

const Profile = ({ match, curUser, history }) => {
    return (
        <React.Fragment>
            <Info curUserJWT={curUser} match={match} />
            <Photos match={match} curUser={curUser} history={history} />
        </React.Fragment>
    );
};

export default Profile;