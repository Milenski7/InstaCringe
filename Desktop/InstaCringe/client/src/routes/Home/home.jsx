import React from 'react';
import Feed from './Feed/feed';

const Home = ({ history, curUser, date }) => {
    return (
        <React.Fragment>
            <Feed history={history} curUser={curUser} date={date} />
        </React.Fragment>
    );
};

export default Home;