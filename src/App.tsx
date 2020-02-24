import React from 'react';
import { Classes, Button } from '@blueprintjs/core';

function App() {
    return (
        <div className={Classes.DARK} style={{ width: "100%", height: "100vh"} }>
            <div>
                <Button icon="add" text="あほっしょしね" /><br/>
                <a href="https://grade.sparebeat.bo-yakitarako.com" target="__blank">そこはかとなく尊い</a>
            </div>
        </div>
    );
}

export default App;
