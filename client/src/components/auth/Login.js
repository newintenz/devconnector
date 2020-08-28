import React, { Component } from 'react'

 class Login extends Component {

    state = {
        email: "",
        password: "",
        errors: {}
    }

    updateField = e => {
        this.setState({[e.target.name] : e.target.value });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const newLogin = {
            email: this.state.email,
            password: this.state.password
        }

        console.log(newLogin);
    }

    render() {
        return (
        <div className="row">
            <div className="col-md-8 m-auto">
            <h1 className="display-4 text-center">Log In</h1>
            <p className="lead text-center">Sign in to your DevConnector account</p>
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                <input type="email" onChange = {this.updateField} className="form-control form-control-lg" placeholder="Email Address" name="email" />
                </div>
                <div className="form-group">
                <input type="password" onChange = {this.updateField} className="form-control form-control-lg" placeholder="Password" name="password" />
                </div>
                <input type="submit" className="btn btn-info btn-block mt-4" />
            </form>
            </div>
        </div>
        )
    }
}


export default Login;