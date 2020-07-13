import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/input';
import Joi from 'joi-browser';
import http from '../../../services/http';
import config from '../../../config/config.json';
import './register.css';

const Register = () => {
    const [user, setUser] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});

    const schema = {
        name: Joi.string().required().max(20),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).max(255)
    };

    const validateSubmit = () => {
        let newErrors = {};
        const { error } = Joi.validate(user, schema, { abortEarly: false });
        if (error) error.details.map(err => newErrors[err.path] = err.message);

        return Object.keys(newErrors).length === 0 ? null : newErrors;
    };

    const validateChange = (e) => {
        const obj = { [e.target.name]: e.target.value };
        const newSchema = { [e.target.name]: schema[e.target.name] };
        const { error } = Joi.validate(obj, newSchema);
        return error ? error.details[0].message : null;
    };

    const handleChange = (e) => {
        const newErrors = { ...errors };
        const errorMessage = validateChange(e);
        if (errorMessage) newErrors[e.target.name] = errorMessage;
        else delete newErrors[e.target.name];
        let newUser = { ...user };
        newUser[e.target.name] = e.target.value;
        setUser(newUser);
        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateSubmit();
        setErrors(newErrors || {});
        if (newErrors) return;

        // call server:
        try {
            const { data } = await http.post(`${config.apiEndpoint}/user`, user);
            localStorage.setItem("user-token", data);
            console.log(data);
            window.location = "/"
        } catch (ex) {
            if (ex.response && ex.response.status === 400) {
                const error = { ...errors };
                error.email = ex.response.data;
                setErrors(error);
            }
        }
    };

    return (
        <div className="register-container">
            <div className="registration-form">
                <form className="form-group2" onSubmit={handleSubmit}>
                    <h1 className="login-container-header">Register:</h1>
                    <Input
                        name="name"
                        value={user.name}
                        type="text"
                        label="Name:"
                        onChange={handleChange}
                        error={errors.name}
                        className="form-control" />
                    <Input
                        name="email"
                        value={user.email}
                        type="text"
                        label="Email:"
                        onChange={handleChange}
                        error={errors.email}
                        className="form-control" />
                    <Input
                        name="password"
                        value={user.password}
                        type="password"
                        label="Password:"
                        onChange={handleChange}
                        error={errors.password}
                        className="form-control" />
                    <button type="submit" className="registration-btn">Register</button>
                </form>
            </div>
            <p className="registration-p">
                Already have an account? Click{" "}
                <Link className="p-link" to="/login">HERE</Link>&nbsp;to login.</p>
        </div>
    );
};

export default Register;