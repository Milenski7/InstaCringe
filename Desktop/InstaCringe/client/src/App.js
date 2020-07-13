import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar/navbar';
import Home from './routes/Home/home';
import Register from './routes/User/Register/register';
import Login from './routes/User/Login/login';
import Logout from './routes/User/Logout/logout';
import Profile from './routes/Profile/profile';
import Post from './routes/Post/post';
import './App.css';
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const [curUser, setCurUser] = useState(null);
  const [date, setDate] = useState(Date.now());
  useEffect(() => {
    try {
      const jwt = localStorage.getItem("user-token");
      const cur = jwtDecode(jwt);
      setCurUser(cur);
    }
    catch (ex) { }
  }, []);

  return (
    <React.Fragment>
      <ToastContainer />
      <Navbar curUser={curUser} />
      <Switch>
        <Route path="/register" exact component={Register} />
        <Route path="/login" exact component={Login} />
        <Route path="/logout" exact component={Logout} />
        <Route path="/profile/:id" exact render={props => <Profile {...props} curUser={curUser} />} />
        <Route path="/profile/:id/:image" exact render={props => <Post {...props} curUser={curUser} />} />
        <Route path="/" exact render={props => <Home {...props} curUser={curUser} date={date} />} />
      </Switch>
    </React.Fragment>
  )
};
export default App;
