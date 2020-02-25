import React from 'react';
import { Classes } from '@blueprintjs/core';
import Menu from './menu/Menu';
import Controller from './menu/Controller';

function App() {
    const isDark = false;
    return (
        <div
            className={isDark ? Classes.DARK : ""}
            style={{
                width: "100%",
                minHeight: "100vh",
                backgroundColor: isDark ? "#30404D" : "#F5F8FA"
            }}
        >
            <Menu/>
            <div style={{textAlign: "left"}}>
                <Controller />
            </div>
        </div>
    );
}

export default App;
