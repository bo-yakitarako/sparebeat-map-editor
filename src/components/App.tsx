import React from 'react';
import { Classes } from '@blueprintjs/core';
import { useSelector } from "react-redux";
import { AppState } from '../store';
import Menu from './menu/Menu';
import Controller from './menu/Controller';
import Map from './map/Map';

const editorStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    maxWidth: '100%',
    minWidth: '100%',
    maxHeight: 'calc(100vh - 50px)',
    minHeight: 'calc(100vh - 50px)',
    textAlign: 'left',
}

function App() {
    const isDark = useSelector((state: AppState) => state.themeBlack);
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
            <div style={editorStyle}>
                <Controller />
                <Map />
            </div>
        </div>
    );
}

export default App;
