import React, { Component } from "react";
import { Link } from "react-router-dom";
import './style/AuthNavbar.css';

class AuthNavbar extends Component {
    render() {
        // const { user } = this.props.user;
        return (
            <div className="navbar-fixed">
                <div className="z-depth-0">
                    <div className="nav-wrapper white row">
                        
                        <div className="col s6">
                            <Link
                                to="/"
                                style={{
                                    fontFamily: "monospace"
                                }}
                                className="brand-logo black-text"
                            >
                                <i className="material-icons">code</i>
                                THE LATTICE VIRTUAL ROOM
                            </Link>
                        </div>
                        <div className="col s6 account">
                            <h6 style={{paddingRight:"10px"}}>
                                <b>Hey there,</b> {this.props.user}
                                <p className="flow-text grey-text"></p>
                            </h6>
                            <button
                                style={{
                                    width:"150px",
                                    borderRadius: "3px",
                                    letterSpacing: "1px",
                                    marginTop: "0rem"
                                }}
                                onClick={this.props.logout}
                                className="btn waves-effect waves-light hoverable blue accent-3">
                                    Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AuthNavbar;