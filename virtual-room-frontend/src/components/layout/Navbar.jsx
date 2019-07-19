import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";


class Navbar extends Component {
  render() {
    console.log(this.props.auth.isAuthenticated)
    return (
      <div>
        {
          !this.props.auth.isAuthenticated ?
            <div className="navbar-fixed">
              <nav className="z-depth-0">
                <div className="nav-wrapper white">
                  <Link
                    to="/"
                    style={{
                      fontFamily: "monospace"
                    }}
                    className="col s5 brand-logo center black-text"
                  >
                    <i className="material-icons">code</i>
                    THE LATTICE VIRTUAL ROOM
                  </Link>
                </div>
              </nav>
            </div>
            :
            console.log()
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { loginUser }
)(Navbar);

// export default Navbar;