import React, { useState } from 'react';
import Input from '../../../components/input';
import { Link } from 'react-router-dom';
import Joi from 'joi-browser';
import * as authService from '../../../services/auth';
import _ from 'lodash';
import './login.css';

const Login = () => {
    const [user, setUser] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const schema = {
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).max(255)
    };

    const validateSubmit = () => {
        const errors = {};
        const { error } = Joi.validate(_.pick(user, ['email', 'password']), schema, { abortEarly: false });
        if (error) error.details.map(err => errors[err.path] = err.message);
        return Object.keys(errors).length === 0 ? null : errors;
    };

    const validateInput = e => {
        const obj = { [e.target.name]: e.target.value };
        const newSchema = { [e.target.name]: schema[e.target.name] };
        const { error } = Joi.validate(obj, newSchema);
        return error ? error.details[0].message : null;
    };

    const handleInput = e => {
        const newErrors = { ...errors };
        const errorMessage = validateInput(e);
        if (errorMessage) newErrors[e.target.name] = errorMessage;
        else delete newErrors[e.target.name];
        const newUser = { ...user };
        newUser[e.target.name] = e.target.value;
        setUser(newUser);
        setErrors(newErrors);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const newErrors = validateSubmit();
        setErrors(newErrors || {});
        if (newErrors) return;
        //call server: 
        try {
            const { data: jwt } = await authService.login(user);
            localStorage.setItem("user-token", jwt);
            window.location = "/";

        } catch (ex) {
            if (ex.response && ex.response.status === 400) {
                const error = { ...errors };
                error.email = ex.response.data;
                setErrors(error);
            }
            if (ex.response && ex.response.status === 404) {
                const error = { ...errors };
                error.email = ex.response.data;
                setErrors(error);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="registration-form-container2">
                <form onSubmit={handleSubmit} className="registration-form">
                    <h1 className="login-container-header">Login:</h1>
                    <Input
                        name="email"
                        type="text"
                        value={user.email}
                        label="Email address:"
                        onChange={handleInput}
                        error={errors.email}
                        className="form-control"
                    />
                    <Input
                        name="password"
                        type="password"
                        value={user.password}
                        label="Password:"
                        onChange={handleInput}
                        error={errors.password}
                        className="form-control"
                    />
                    <button type="submit" className="registration-btn">Sign in</button>
                </form>
                <div className="registration-container">
                    <h1 className="registration-header">New to InstaCringe?</h1>
                    <p className="registration-list-header">Create an account with us and you'll be able to:</p>
                    <ul className="registration-list">
                        <li className='registration-list-item'>Follow your friends</li>
                        <li className='registration-list-item'>Look at all their recent posts</li>
                        <li className='registration-list-item'>Like and Comment</li>
                        <li className='registration-list-item'>Upload photos in your profile</li>
                        <li className='registration-list-item'>Build custom personal info and more...</li>
                    </ul>
                    <Link to="/register"><button className="registration-link-btn">Create Account</button></Link>
                </div>
            </div>
        </div>
    );
};

export default Login;