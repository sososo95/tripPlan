import React from 'react'
import { useState } from 'react'
import App from './App'
import './index.css'

function Pagecheck() {

    const [tripDay, setDays] = useState(1);

    const handleDaysIncrement = () => {
        setDays(tripDay => tripDay + 1);
    };

    const handleDaysDecrement = () => {
        setDays(tripDay => (tripDay > 1 ? tripDay - 1 : 1));
    };

    const apps = Array.from({ length: tripDay }, (_, index) => <App key={index} id={index + 1} />);

    return (
        <>
            <h1>여행플랜 지도 테스트</h1>
            <button>저장(예정)</button>
            <div>
                <button onClick={handleDaysIncrement}>일수+</button>
                <button onClick={handleDaysDecrement}>일수-</button>
            </div>
            {apps}
        </>
    )
}

export default Pagecheck