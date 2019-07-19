import React, { Component } from "react";
import "./style/AvailableRooms.css";

class AvailableRooms extends Component {
    constructor() {
        super();
    }

    render () {
        return (
            <div>
                <header>
                    <h4>Available Rooms</h4>
                </header>

                <div className="rooms">

                </div>
            </div>
        )
    }
}

export default AvailableRooms;